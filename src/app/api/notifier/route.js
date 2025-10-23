import { AppConfig } from "@/config/AppConfig";
import { MailNotifier } from "@/notifiers/MailNotifier";

export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const notifierType = searchParams.get("type");
  const notifierData = await request.json();
  if (notifierType === "email") {
    var notifier = new MailNotifier(AppConfig.getConfig().notifier.mail);
  }
  return new Response(notifierType, { status: 200 });
}
