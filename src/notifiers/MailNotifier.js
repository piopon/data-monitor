import { Notifier } from "./Notifier.js";
import NodeMailer from "nodemailer";

export class MailNotifier extends Notifier {
  #transporter = undefined;

  constructor(config) {
    this.#transporter = NodeMailer.createTransport({
      service: config.service,
      auth: {
        user: config.address,
        pass: config.password,
      },
    });
  }
}
