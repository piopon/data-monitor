import { AppConfig } from "@/config/AppConfig";
import { MailNotifier } from "@/notifiers/MailNotifier";

/**
 * Method used to send the notifier POST request to send notification
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notification sent result
 */
export async function POST(request) {
  const notifierType = request.nextUrl.searchParams.get("type");
  if (notifierType === "email") {
    var notifier = new MailNotifier(AppConfig.getConfig().notifier.mail);
  } else {
    return new Response(`Unsupported notifier type: ${notifierType}`, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const notifierData = await request.json();
  const res = await notifier.notify(notifierData);
  return new Response(JSON.stringify(res.info), {
    status: res.result ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
}
