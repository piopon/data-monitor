import NodeMailer from "nodemailer";
import { MailNotifier } from "../../src/notifiers/MailNotifier.js";

jest.mock("nodemailer", () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe("MailNotifier", () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    NodeMailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("creates transporter with expected service and auth", () => {
    const config = {
      service: "gmail",
      address: "sender@test.com",
      password: "secret",
    };

    new MailNotifier(config);

    expect(NodeMailer.createTransport).toHaveBeenCalledWith({
      service: "gmail",
      auth: {
        user: "sender@test.com",
        pass: "secret",
      },
    });
  });

  test("sends email successfully", async () => {
    sendMailMock.mockResolvedValueOnce({});

    const notifier = new MailNotifier({
      service: "gmail",
      address: "sender@test.com",
      password: "secret",
    });

    const result = await notifier.notify({
      receiver: "receiver@test.com",
      name: "CPU",
      details: { message: "Threshold exceeded" },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "sender@test.com",
      to: "receiver@test.com",
      subject: "[data-monitor] CPU reached its threshold condition",
      text: "Threshold exceeded",
    });
    expect(result).toEqual({ result: true, info: "Email sent to receiver@test.com" });
  });

  test("returns failure when sending email fails", async () => {
    sendMailMock.mockRejectedValueOnce(new Error("smtp error"));

    const notifier = new MailNotifier({
      service: "gmail",
      address: "sender@test.com",
      password: "secret",
    });

    const result = await notifier.notify({
      receiver: "receiver@test.com",
      name: "CPU",
      details: { message: "Threshold exceeded" },
    });

    expect(result.result).toBe(false);
    expect(result.info).toContain("Cannot send email to receiver@test.com");
    expect(result.info).toContain("Error: smtp error");
  });
});
