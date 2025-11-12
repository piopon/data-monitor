import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import { NotifierRegistry } from "@/notifiers/core/NotifierRegistry";

/**
 * Method used to send the notifier POST request to send notification
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notification sent result
 */
export async function POST(request) {
  const notifierType = request.nextUrl.searchParams.get("type");
  try {
    const notifierInfo = NotifierCatalog.getClassInfo(notifierType);
    const notifier = NotifierRegistry.create(notifierInfo);
    const notifierData = await request.json();
    const res = await notifier.notify(notifierData);
    return new Response(JSON.stringify(res.info), {
      status: res.result ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error.message, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
