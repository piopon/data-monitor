import { AppConfig } from "@/config/AppConfig";
import { MailNotifier } from "@/notifiers/MailNotifier";

export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const notifierType = searchParams.get("type");
  const notifierData = await request.json();
  if (notifierType === "email") {
    var notifier = new MailNotifier(AppConfig.getConfig().notifier.mail);
  }
  const res = await notifier.notify(notifierData);
  return new Response(JSON.stringify(res.info), {
    status: res.result ? 200 : 400,
    headers: { "Content-Type": "application/json" },
  });
}
