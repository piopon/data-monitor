import { NotifierService } from "@/model/NotifierService";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import { NotifierRegistry } from "@/notifiers/core/NotifierRegistry";

const PRIVATE_PLACEHOLDER = "PRIVATE";

function normalizeSensitiveInput(value) {
  return value === PRIVATE_PLACEHOLDER ? "" : value;
}

function normalizeNotifierInput(notifier) {
  if (notifier == null) {
    return notifier;
  }
  return {
    ...notifier,
    origin: normalizeSensitiveInput(notifier.origin),
    password: normalizeSensitiveInput(notifier.password),
  };
}

function getSafeNotifier(notifier) {
  if (notifier == null) {
    return notifier;
  }
  return {
    ...notifier,
    origin: notifier.origin ? PRIVATE_PLACEHOLDER : "",
    password: notifier.password ? PRIVATE_PLACEHOLDER : "",
  };
}

/**
 * Method used to send the notifier GET request to retrieve notifier data
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notifiers data
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    if (0 === searchParams.size) {
      const notifiers = await NotifierService.getNotifiers();
      return new Response(JSON.stringify(notifiers.map((notifier) => getSafeNotifier(notifier))), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const origin = searchParams.get("origin");
    const sender = searchParams.get("sender");
    const password = searchParams.get("password");
    const notifiers = await NotifierService.filterNotifiers({
      ...(id && { id }),
      ...(type && { type }),
      ...(origin && { threshold }),
      ...(sender && { sender }),
      ...(password && { password }),
    });
    return new Response(JSON.stringify(notifiers.map((notifier) => getSafeNotifier(notifier))), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get notifiers: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the notifier POST request to send notification
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notification sent result
 */
export async function POST(request) {
  const notifierType = request.nextUrl.searchParams.get("type");
  try {
    // if 'type' parameter is provided then we want to send notification message
    if (notifierType) {
      const notifierInfo = NotifierCatalog.getClassInfo(notifierType);
      const notifier = NotifierRegistry.create(notifierInfo);
      const notifierData = await request.json();
      const res = await notifier.notify(notifierData);
      return new Response(JSON.stringify(res.info), {
        status: res.result ? 200 : 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // no 'type' parameter provider hence we want to create new notifier
    const notifier = await NotifierService.addNotifier(normalizeNotifierInput(await request.json()));
    return new Response(JSON.stringify(getSafeNotifier(notifier)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error.message, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the notifier PUT request to send notification
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notification sent result
 */
export async function PUT(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const notifierData = normalizeNotifierInput(await request.json());
    const monitor = await NotifierService.editNotifier(id, notifierData);
    return new Response(JSON.stringify(getSafeNotifier(monitor)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update notifier: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the notifier DELETE request to send notification
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notification sent result
 */
export async function DELETE(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const deletedNo = await NotifierService.deleteNotifier(id);
    const response = { message: `Deleted ${deletedNo} notifier(s)` };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot delete notifier: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
