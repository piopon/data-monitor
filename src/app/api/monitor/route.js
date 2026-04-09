import { Monitor } from "@/model/Monitor";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { authorizeUser } from "@/lib/ApiUserAuth";
import { DataSanitizer } from "@/lib/DataSanitizer";
import { RequestUtils } from "@/lib/RequestUtils";

const SUPPORTED_CONDITIONS = new Set(Monitor.CONDITIONS.map((condition) => condition.value));

/**
 * Method used to sanitize monitor text input values at API boundary
 * @param {unknown} value Raw monitor text value
 * @param {Number} maxLength Maximum output length
 * @returns sanitized monitor text value
 */
function sanitizeMonitorText(value, maxLength) {
  return DataSanitizer.sanitizeText(typeof value === "string" ? value : "", maxLength);
}

/**
 * Method used to normalize monitor condition values
 * @param {unknown} value Raw monitor condition
 * @returns sanitized condition when valid, empty string otherwise
 */
function sanitizeMonitorCondition(value) {
  const sanitized = sanitizeMonitorText(value, 8);
  return SUPPORTED_CONDITIONS.has(sanitized) ? sanitized : "";
}

/**
 * Method used to normalize query filter values before querying monitor data
 * @param {URLSearchParams} searchParams Query parameters object
 * @returns normalized monitor filters object
 */
function normalizeMonitorFilters(searchParams) {
  const id = searchParams.get("id");
  const parent = sanitizeMonitorText(searchParams.get("parent"), 256);
  const enabled = searchParams.get("enabled");
  const threshold = searchParams.get("threshold");
  const condition = sanitizeMonitorCondition(searchParams.get("condition"));
  const notifier = searchParams.get("notifier");
  const interval = searchParams.get("interval");
  return {
    ...(id && { id }),
    ...(parent && { parent }),
    ...(enabled && { enabled }),
    ...(threshold && { threshold }),
    ...(condition && { condition }),
    ...(notifier && { notifier }),
    ...(interval && { interval }),
  };
}

/**
 * Method used to normalize monitor payload text fields before save/update operations
 * @param {Object} monitorData Input monitor payload
 * @returns normalized monitor payload
 */
function normalizeMonitorInput(monitorData) {
  if (monitorData == null) {
    return monitorData;
  }
  const normalized = { ...monitorData };
  if (monitorData.parent != null) {
    const sanitizedParent = sanitizeMonitorText(monitorData.parent, 256);
    if (!sanitizedParent) {
      const error = new Error("Invalid monitor parent.");
      error.status = 400;
      throw error;
    }
    normalized.parent = sanitizedParent;
  }
  if (monitorData.condition != null) {
    const sanitizedCondition = sanitizeMonitorCondition(monitorData.condition);
    if (!sanitizedCondition) {
      const error = new Error("Invalid monitor condition.");
      error.status = 400;
      throw error;
    }
    normalized.condition = sanitizedCondition;
  }
  return normalized;
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
    const error = new Error("Invalid monitor notifier ID.");
    error.status = 400;
    throw error;
  }
  const notifiers = await NotifierService.filterNotifiers({ id: parsedNotifierId, user: userId });
  if (notifiers.length !== 1) {
    const error = new Error("Selected notifier does not belong to the authorized user.");
    error.status = 403;
    throw error;
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
    const monitors = await MonitorService.filterMonitors({
      ...normalizeMonitorFilters(searchParams),
      user: authorizedUserId,
    });
    return new Response(JSON.stringify(monitors), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get monitors: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
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
    const monitorData = normalizeMonitorInput(await request.json());
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
      status: RequestUtils.getErrorStatus(error),
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
    const monitorData = normalizeMonitorInput(await request.json());
    await assertNotifierOwnership(authorizedUserId, monitorData.notifier);
    const monitor = await MonitorService.editMonitorForUser(id, authorizedUserId, monitorData);
    if (monitor == null) {
      const error = new Error("Monitor not found for provided user and id.");
      error.status = 404;
      throw error;
    }
    return new Response(JSON.stringify(monitor), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update monitor: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
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
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}
