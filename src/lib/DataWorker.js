import { MonitorService } from "../model/MonitorService.js";
import { NotifierCatalog } from "../notifiers/core/NotifierCatalog.js";
import { NotifierValidator } from "../notifiers/core/NotifierValidator.js";
import { UserService } from "../model/UserService.js";
import { DataUtils } from "./DataUtils.js";
import { RequestUtils } from "./RequestUtils.js";

import waitOn from "wait-on";
import fs from "fs";

const INTERVAL = process.env.CHECK_INTERVAL || 60_000;
const DELAY = process.env.CHECK_DELAY || 5_000;
const WAIT = process.env.CHECK_WAIT || 1_000;
const SERVER_ADDRESS = `http://${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
const SEND_INTERVAL = process.env.CHECK_NOTIFY || 1 * 60 * 60 * 1_000;
const MONITOR_CONCURRENCY = Number.parseInt(process.env.CHECK_MONITOR_CONCURRENCY, 10) || 10;
const USER_SEND_TIMESTAMPS = new Map();
const NOTIFIER_TYPES = new Map();
const RUNNING_USER_CHECKS = new Set();
const SEND_ROOT_DIR = "users";

/**
 * Method used to stop program execution for specified number of milliseconds
 * @note This method wraps setTimeout method into easy-to-use manner
 * @param {Number} ms Number of milliseconds to stop program execution
 * @returns promise with sleep result when user can invoke action to do after sleep
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Method used to verify two input values against each other
 * @param {Number} val1 First value to be verified
 * @param {String} operator The operator used to verify both values
 * @param {Number} val2 Second value to be verified
 * @returns true of values are metting comparison, false otherwise
 */
function verify(val1, operator, val2) {
  if ("<" === operator) {
    return val1 < val2;
  } else if ("≤" === operator) {
    return val1 <= val2;
  } else if ("≥" === operator) {
    return val1 >= val2;
  } else if (">" === operator) {
    return val1 > val2;
  } else {
    return false;
  }
}

/**
 * Method used to retrieve user's send timestamp file name
 * @param {Object} user The user for which we want to get the file name
 * @returns path with input user's timestamp file name
 */
function getUserTimestampFile(user) {
  return `${SEND_ROOT_DIR}/${user.email}_timestamps.json`;
}

/**
 * Method used to retrieve cache key for current user data maps
 * @param {Object} user The user for which we want to get cache key
 * @returns stable cache key for user-related in-memory maps
 */
function getUserCacheKey(user) {
  return String(user.id || user.email);
}

/**
 * Method used to retrieve user's notification timestamps map
 * @param {Object} user The user for which we want to get notification timestamps
 * @returns map with monitor identifiers and their last send timestamps
 */
function getUserTimestamps(user) {
  const userCacheKey = getUserCacheKey(user);
  if (!USER_SEND_TIMESTAMPS.has(userCacheKey)) {
    const userTimestamps = new Map();
    const timestampFile = getUserTimestampFile(user);
    if (fs.existsSync(timestampFile)) {
      try {
        const fileContent = JSON.parse(fs.readFileSync(timestampFile));
        for (const [key, value] of Object.entries(fileContent)) {
          userTimestamps.set(key, value);
        }
      } catch (error) {
        // file is unreadable or contains invalid JSON
        console.warn(`Worker warning: timestamp file is unreadable for user: ${user.email}`)
      }
    }
    USER_SEND_TIMESTAMPS.set(userCacheKey, userTimestamps);
  }
  return USER_SEND_TIMESTAMPS.get(userCacheKey);
}

/**
 * Method used to check if notification send timestamp is within provided time frame
 * @param {Object} user The user for which we want to check the send timestamp value
 * @param {String} monitorId The monitor name identifier for which we want to check
 * @param {Number} time The number of milliseconds defining notification sent time frame
 * @returns true when notification was sent in the time frame, false otherwise
 */
function checkSendTimestamp(user, monitorId, time) {
  const userTimestamps = getUserTimestamps(user);
  if (userTimestamps.has(monitorId) === false) {
    return false;
  }
  const sentDiff = Math.abs(Date.now() - userTimestamps.get(monitorId));
  return sentDiff <= time;
}

/**
 * Method used to update notification sent timestamp for the provided monitor
 * @param {Object} user The user for which we want to update the send timestamp value
 * @param {String} monitorId The monitor name identificer for which we want to update timestamp
 */
function updateSendTimestamp(user, monitorId) {
  const userTimestamps = getUserTimestamps(user);
  userTimestamps.set(monitorId, Date.now());
  const fileContent = JSON.stringify(Object.fromEntries(userTimestamps));
  fs.writeFileSync(getUserTimestampFile(user), fileContent);
}

/**
 * Method used to retrieve notifier type for provided monitor's notifier ID
 * @note This method caches notifier ID -> type mapping to limit API requests
 * @param {Object} monitor Parent monitor for which we want to resolve notifier type
 * @returns notifier type when available, null otherwise
 */
async function getNotifierType(monitor) {
  if (monitor?.notifier_id == null) {
    console.warn(`Worker warning: Monitor ${monitor.parent} has no notifier configured.`);
    return null;
  }
  const notifierId = String(monitor.notifier_id);
  if (NOTIFIER_TYPES.has(notifierId)) {
    return NOTIFIER_TYPES.get(notifierId);
  }
  let notifierResponse;
  try {
    notifierResponse = await RequestUtils.fetchWithRetry(`${SERVER_ADDRESS}/api/notifier?id=${notifierId}`);
  } catch (error) {
    console.error(`Worker error: Cannot fetch notifier data: ${error.message}`);
    return null;
  }
  const notifierData = await notifierResponse.json();
  if (!notifierResponse.ok) {
    console.error(`Worker error: Cannot get notifier data: ${notifierData.message}`);
    return null;
  }
  if (0 === notifierData.length) {
    console.warn(`Worker warning: Notifier not configured for monitor ${monitor.parent}.`);
    return null;
  }
  if (1 !== notifierData.length) {
    console.error(`Worker error: Received multiple notifiers for monitor ${monitor.parent}!`);
    return null;
  }

  const notifierType = notifierData[0].type;
  NOTIFIER_TYPES.set(notifierId, notifierType);
  return notifierType;
}

/**
 * Main worker method used to check scraper data against threshold
 * @param {Object} user Parent user for which we want to check data
 */
async function checkData(user) {
  const userCheckKey = getUserCacheKey(user);
  if (RUNNING_USER_CHECKS.has(userCheckKey)) {
    console.log(`Worker info: previous check for user ${user.email} is still running. Skipping this run.`);
    return;
  }
  RUNNING_USER_CHECKS.add(userCheckKey);
  try {
    // filter out enabled monitors which were not notified in their timeframe (cooldown)
    const enabledMonitors = await MonitorService.filterMonitors({ user: user.id, enabled: true });
    const monitorsToCheck = enabledMonitors.filter((monitor) => {
      const sendInterval = monitor.interval || SEND_INTERVAL;
      if (checkSendTimestamp(user, monitor.parent, sendInterval)) {
        console.log(`${monitor.parent} notification was sent in the last ${sendInterval / 1_000} seconds. Skipping.`);
        return false;
      }
      return true;
    });
    if (monitorsToCheck.length === 0) {
      return;
    }
    // perform a bulk request of all scraper items (should be faster and cheaper than multiple small requests)
    let scraperResponse;
    try {
      scraperResponse = await RequestUtils.fetchWithRetry(`${SERVER_ADDRESS}/api/scraper/items`, {
        method: "GET",
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
    } catch (error) {
      console.error(`Worker error: Cannot fetch scraper data: ${error.message}`);
      return;
    }
    if (!scraperResponse.ok) {
      console.error("Worker error: Cannot get scraper data: ", await scraperResponse.text());
      return;
    }
    const scraperData = await scraperResponse.json();
    if (!Array.isArray(scraperData)) {
      console.error("Worker error: Cannot parse scraper data response.");
      return;
    }
    const scraperDataByName = new Map();
    scraperData.forEach((item) => {
      if (item?.name) {
        const itemId = DataUtils.nameToId(item.name);
        if (!scraperDataByName.has(itemId)) {
          scraperDataByName.set(itemId, item);
        }
      }
    });
    // notify all monitors with true condition using bounded concurrency
    const concurrentBound = Number.isFinite(MONITOR_CONCURRENCY) && MONITOR_CONCURRENCY > 0 ? MONITOR_CONCURRENCY : 10;
    for (let index = 0; index < monitorsToCheck.length; index += concurrentBound) {
      const monitorBatch = monitorsToCheck.slice(index, index + concurrentBound);
      await Promise.allSettled(
        monitorBatch.map(async (monitor) => {
          try {
            const monitorItemId = DataUtils.nameToId(monitor.parent);
            const scraperItem = scraperDataByName.get(monitorItemId);
            if (!scraperItem) {
              console.error(`Worker error: Cannot find ${monitor.parent} in scraper data...`);
              return;
            }
            if (verify(parseFloat(scraperItem.data), monitor.condition, parseFloat(monitor.threshold))) {
              const notifierType = await getNotifierType(monitor);
              if (!notifierType) {
                return;
              }
              console.log(`Sending notification: ${monitor.parent} over threshold!`);
              const matchedNotifiers = NotifierCatalog.getSupportedNotifiers()
                .keys()
                .filter((notifier) => notifierType === notifier);
              await Promise.allSettled(
                matchedNotifiers.map(async (notifier) => {
                  const condition = `${scraperItem.data} ${monitor.condition} ${monitor.threshold}`;
                  const message = `Monitored value reached its threshold condition: ${condition}`;
                  let notifyResponse;
                  try {
                    notifyResponse = await RequestUtils.fetchWithRetry(`${SERVER_ADDRESS}/api/notifier?type=${notifier}`, {
                      method: "POST",
                      body: JSON.stringify({
                        name: monitor.parent,
                        receiver: user.email,
                        avatar: scraperItem.icon,
                        details: { message, data: scraperItem.data, threshold: monitor.threshold },
                      }),
                    });
                  } catch (error) {
                    console.error(`Notification error: ${error.message}`);
                    return;
                  }
                  if (!notifyResponse.ok) {
                    console.error(`Notification error: ${await notifyResponse.json()}`);
                    return;
                  }
                  updateSendTimestamp(user, monitor.parent);
                  console.log(`Notification ok: ${await notifyResponse.json()}`);
                }),
              );
            } else {
              console.log(`${monitor.parent} does not meet its threshold value...`);
            }
          } catch (error) {
            console.error("Worker error: ", error.message);
          }
        }),
      );
    }
  } catch (error) {
    console.error("Worker error: ", error.message);
  } finally {
    RUNNING_USER_CHECKS.delete(userCheckKey);
  }
}

// check notifiers configuration correctness
if (!NotifierValidator.validateConfiguration().result) {
  process.exit(1);
}
// wait for Next.js server to be up and running before getting data
await waitOn({ delay: DELAY, interval: WAIT, resources: [SERVER_ADDRESS] });
// create parent directory for all worker's files
fs.mkdirSync(SEND_ROOT_DIR, { mode: 777, recursive: true });
// start data check logic for each user in database with appropriate delay
UserService.getUsers()
  .then((users) => {
    users.forEach((user, index) => {
      sleep((INTERVAL / 10) * index).then(() => {
        console.log(`Worker info: started for user ${user.email}`);
      });
      setInterval(checkData, INTERVAL, user);
      checkData(user);
    });
  })
  .catch((error) => console.error(`Worker error: cannot get users: ${error}`));
