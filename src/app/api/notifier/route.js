import { NotifierService } from "@/model/NotifierService";
import { authorizeUser } from "@/lib/ApiUserAuth";
import { RequestUtils } from "@/lib/RequestUtils";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import { NotifierRegistry } from "@/notifiers/core/NotifierRegistry";
import { AppConfig } from "@/config/AppConfig";

const PRIVATE_PLACEHOLDER = "PRIVATE";

/**
 * Method used to normalize placeholder values before persisting sensitive fields
 * @param {String} value Input value received from client
 * @returns normalized value suitable for service layer updates
 */
function normalizeSensitiveInput(value) {
  return value === PRIVATE_PLACEHOLDER ? "" : value;
}

/**
 * Method used to normalize incoming notifier payload before save/update operations
 * @param {Object} notifier Input notifier payload from request body
 * @returns normalized notifier payload
 */
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

/**
 * Method used to mask sensitive notifier fields in API responses
 * @param {Object} notifier Notifier object returned by service layer
 * @returns notifier object with masked sensitive fields
 */
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
 * Method used to map database notifier record into runtime notifier configuration
 * @param {Object} notifier Notifier row loaded from database
 * @returns notifier runtime configuration object
 */
function toNotifierRuntimeConfig(notifier) {
  if (notifier.type === "discord") {
    return {
      webhook: notifier.origin,
      name: notifier.sender,
      avatar: AppConfig.getConfig().notifier.discord.avatar,
    };
  }
  if (notifier.type === "email") {
    return {
      service: notifier.origin,
      address: notifier.sender,
      password: notifier.password,
    };
  }
  throw new Error(`Unsupported notifier type: ${notifier.type}`);
}

/**
 * Method used to load notifier configuration from database for notification send operation
 * @param {String} notifierType Notifier type requested by API caller
 * @returns notifier configuration object prepared for runtime notifier instance
 */
async function getNotifierRuntimeConfig(notifierType, userId) {
  const notifiers = await NotifierService.filterNotifiers({ type: notifierType, user: userId });
  if (notifiers.length === 0) {
    throw new Error(`Cannot find configured '${notifierType}' notifier.`);
  }
  return toNotifierRuntimeConfig(notifiers[0]);
}

/**
 * Method used to send the notifier GET request to retrieve notifier data
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing notifiers data
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const origin = searchParams.get("origin");
    const sender = searchParams.get("sender");
    const password = searchParams.get("password");
    const notifiers = await NotifierService.filterNotifiers({
      ...(id && { id }),
      ...(type && { type }),
      ...(origin && { origin }),
      ...(sender && { sender }),
      ...(password && { password }),
      user: authorizedUserId,
    });
    return new Response(JSON.stringify(notifiers.map((notifier) => getSafeNotifier(notifier))), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get notifiers: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
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
    const searchParams = request.nextUrl.searchParams;
    const userFromQuery = searchParams.get("user");
    // if 'type' parameter is provided then we want to send notification message
    if (notifierType) {
      const authorizedUserId = await authorizeUser(request, userFromQuery);
      const notifierInfo = NotifierCatalog.getClassInfo(notifierType);
      const notifierConfig = await getNotifierRuntimeConfig(notifierType, authorizedUserId);
      const notifier = NotifierRegistry.create(notifierInfo, notifierConfig);
      const notifierData = await request.json();
      const res = await notifier.notify(notifierData);
      return new Response(JSON.stringify(res.info), {
        status: res.result ? 200 : 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // no 'type' parameter provider hence we want to create new notifier
    const input = normalizeNotifierInput(await request.json());
    const authorizedUserId = await authorizeUser(request, input.user);
    const notifier = await NotifierService.addNotifier({
      ...input,
      user: authorizedUserId,
    });
    return new Response(JSON.stringify(getSafeNotifier(notifier)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot process notifier request: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error, 500),
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
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const notifierData = normalizeNotifierInput(await request.json());
    const monitor = await NotifierService.editNotifierForUser(id, authorizedUserId, notifierData);
    if (monitor == null) {
      throw new Error("Notifier not found for provided user and id.");
    }
    return new Response(JSON.stringify(getSafeNotifier(monitor)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update notifier: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
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
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const deletedNo = await NotifierService.deleteNotifierForUser(id, authorizedUserId);
    const response = { message: `Deleted ${deletedNo} notifier(s)` };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot delete notifier: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}
