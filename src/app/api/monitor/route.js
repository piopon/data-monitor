import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { UserService } from "@/model/UserService";

/**
 * Method used to parse bearer token from request authorization header
 * @param {Object} request Request object received from frontend
 * @returns token string if present, otherwise null
 */
function getBearerToken(request) {
  const authorizationHeader = request.headers.get("authorization") || "";
  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const token = authorizationHeader.substring(7).trim();
  return token === "" ? null : token;
}

/**
 * Method used to parse and validate user id value from request input
 * @param {String|Number} userInput user identifier from query or body
 * @returns numeric user id
 */
function parseUserId(userInput) {
  const userId = Number.parseInt(String(userInput), 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid monitor user ID.");
  }
  return userId;
}

/**
 * Method used to verify request user ownership using bearer token
 * @param {Object} request Request object received from frontend
 * @param {String|Number} userInput user identifier from query or body
 * @returns validated numeric user id
 */
async function authorizeUser(request, userInput) {
  const userId = parseUserId(userInput);
  const token = getBearerToken(request);
  if (token == null) {
    throw new Error("Missing or invalid authorization header.");
  }
  const users = await UserService.filterUsers({ id: userId, jwt: token });
  if (users.length !== 1) {
    throw new Error("User authorization failed.");
  }
  return userId;
}

/**
 * Method used to validate notifier ownership for monitor operations
 * @param {Number} userId authorized user identifier
 * @param {Number|String|null} notifierId notifier identifier to validate
 */
async function assertNotifierOwnership(userId, notifierId) {
  if (notifierId == null) {
    return;
  }
  const parsedNotifierId = Number.parseInt(String(notifierId), 10);
  if (!Number.isInteger(parsedNotifierId) || parsedNotifierId <= 0) {
    throw new Error("Invalid monitor notifier ID.");
  }
  const notifiers = await NotifierService.filterNotifiers({ id: parsedNotifierId, user: userId });
  if (notifiers.length !== 1) {
    throw new Error("Selected notifier does not belong to the authorized user.");
  }
}

/**
 * Method used to send the monitor GET request to retrieve monitor data
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing monitors data
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const id = searchParams.get("id");
    const parent = searchParams.get("parent");
    const enabled = searchParams.get("enabled");
    const threshold = searchParams.get("threshold");
    const condition = searchParams.get("condition");
    const notifier = searchParams.get("notifier");
    const interval = searchParams.get("interval");
    const monitors = await MonitorService.filterMonitors({
      ...(id && { id }),
      ...(parent && { parent }),
      ...(enabled && { enabled }),
      ...(threshold && { threshold }),
      ...(condition && { condition }),
      ...(notifier && { notifier }),
      ...(interval && { interval }),
      user: authorizedUserId,
    });
    return new Response(JSON.stringify(monitors), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get monitors: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the monitor POST request to add new monitor
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing added monitor data
 */
export async function POST(request) {
  try {
    const monitorData = await request.json();
    const authorizedUserId = await authorizeUser(request, monitorData.user);
    await assertNotifierOwnership(authorizedUserId, monitorData.notifier);
    const monitor = await MonitorService.addMonitor({
      ...monitorData,
      user: authorizedUserId,
    });
    return new Response(JSON.stringify(monitor), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot add new monitor: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the monitor PUT request to edit monitor specified by ID
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing edited monitor data
 */
export async function PUT(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const monitorData = await request.json();
    await assertNotifierOwnership(authorizedUserId, monitorData.notifier);
    const monitor = await MonitorService.editMonitorForUser(id, authorizedUserId, monitorData);
    if (monitor == null) {
      throw new Error("Monitor not found for provided user and id.");
    }
    return new Response(JSON.stringify(monitor), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update monitor: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Method used to send the monitor DELETE request to delete monitor specified by ID
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JSON value containing number of deleted monitors
 */
export async function DELETE(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const user = searchParams.get("user");
    const authorizedUserId = await authorizeUser(request, user);
    const deletedNo = await MonitorService.deleteMonitorForUser(id, authorizedUserId);
    const response = { message: `Deleted ${deletedNo} monitor(s)` };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot delete monitor: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
