import NodeMailer from "nodemailer";

export class MailNotifier {
  #transporter = undefined;
  #config = undefined;

  /**
   * Creates a new mail notifier with the specified configuration
   * @param {Object} config Input configurationn used to create SMTP transport layer
   */
  constructor(config) {
    this.#config = config;
    this.#transporter = NodeMailer.createTransport({
      service: config.service,
      auth: {
        user: config.address,
        pass: config.password,
      },
    });
  }

  /**
   * Method used to notify the user about data reaching threshold
   * @param {Object} data The notification values to be sent
   * @returns true when notification succeeds, false otherwise
   */
  async notify(data) {
    const mailOptions = {
      from: this.#config.address,
      to: data.receiver,
      subject: `[data-monitor] ${data.name} reached its threshold condition`,
      text: data.details.message,
    };
    try {
      await this.#transporter.sendMail(mailOptions);
      return { result: true, info: `Email sent to ${data.receiver}` };
    } catch (error) {
      return { result: false, info: `Cannot send email to ${data.receiver}: ${error}` };
    }
  }
}
