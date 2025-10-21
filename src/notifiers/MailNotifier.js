import { Notifier } from "./Notifier.js";
import NodeMailer from "nodemailer";

export class MailNotifier extends Notifier {
  #transporter = undefined;
  #config = undefined;

  constructor(config) {
    super();
    this.#config = config;
    this.#transporter = NodeMailer.createTransport({
      service: config.service,
      auth: {
        user: config.address,
        pass: config.password,
      },
    });
  }

  async notify(data) {
    const mailOptions = {
      from: this.#config.address,
      to: data.receiver,
      subject: `[data-monitor] ${data.name} reached its threshold condition`,
      text: data.details,
    };
    try {
        await this.#transporter.sendMail(mailOptions);
        return {result: true, info: `Email sent to ${data.receiver}`};
    } catch (error) {
        return {result: false, info: `Cannot send email to ${data.receiver}: ${error}`};
    }
  }
}
