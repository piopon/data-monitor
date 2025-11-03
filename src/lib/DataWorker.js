import { Monitor } from "../model/Monitor.js";
import { MonitorService } from "../model/MonitorService.js";
import { UserService } from "../model/UserService.js";

import waitOn from "wait-on";
import fs from "fs";

const INTERVAL = process.env.CHECK_INTERVAL || 60_000;
const DELAY = process.env.CHECK_DELAY || 5_000;
const WAIT = process.env.CHECK_WAIT || 1_000;
const SERVER_ADDRESS = `http://${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
const SEND_INTERVAL = process.env.CHECK_NOTIFY || 1 * 60 * 60 * 1_000;
const SEND_TIMESTAMPS = new Map();
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
 * Method used to check if notification send timestamp is within provided time frame
 * @param {Object} user The user for which we want to check the send timestamp value
 * @param {String} monitorId The monitor name identifier for which we want to check
 * @param {Number} time The number of milliseconds defining notification sent time frame
 * @returns true when notification was sent in the time frame, false otherwise
 */
function checkSendTimestamp(user, monitorId, time) {
  const timestampFile = getUserTimestampFile(user);
  if (SEND_TIMESTAMPS.size === 0 && fs.existsSync(timestampFile)) {
    const fileContent = JSON.parse(fs.readFileSync(timestampFile));
    for (const [key, value] of Object.entries(fileContent)) {
      SEND_TIMESTAMPS.set(key, value);
    }
  }
  if (SEND_TIMESTAMPS.has(monitorId) === false) {
    return false;
  }
  const sentDiff = Math.abs(Date.now() - SEND_TIMESTAMPS.get(monitorId));
  return sentDiff <= time;
}

/**
 * Method used to update notification sent timestamp for the provided monitor
 * @param {Object} user The user for which we want to update the send timestamp value
 * @param {String} monitorId The monitor name identificer for which we want to update timestamp
 */
function updateSendTimestamp(user, monitorId) {
  SEND_TIMESTAMPS.set(monitorId, Date.now());
  const fileContent = JSON.stringify(Object.fromEntries(SEND_TIMESTAMPS));
  fs.writeFileSync(getUserTimestampFile(user), fileContent);
}

/**
 * Main worker method used to check scraper data against threshold
 * @param {Object} user Parent user for which we want to check data
 */
async function checkData(user) {
  try {
    const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
    enabledMonitors.forEach(async (monitor) => {
      // get scraper data item value for specified user's enabled monitor
      const scraperResponse = await fetch(`${SERVER_ADDRESS}/api/scraper/items?name=${monitor.parent}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
      if (!scraperResponse.ok) {
        console.error("Worker error: ", await scraperResponse.text());
        return;
      }
      const scraperData = await scraperResponse.json();
      if (scraperData.length !== 1) {
        console.error(`Worker error: cannot find ${monitor.parent} in scraper data...`);
        return;
      }
      if (verify(parseFloat(scraperData[0].data), monitor.condition, parseFloat(monitor.threshold))) {
        const sendInterval = monitor.interval || SEND_INTERVAL;
        if (checkSendTimestamp(user, monitor.parent, sendInterval)) {
          console.log(`${monitor.parent} notification was sent in the last ${sendInterval / 1_000} seconds. Skipping.`);
          return;
        }
        console.log(`Sending notification: ${monitor.parent} over threshold!`);
        Monitor.NOTIFIERS.filter((notifier) => monitor.notifier === notifier.value).forEach(async (notifier) => {
          const condition = `${scraperData[0].data} ${monitor.condition} ${monitor.threshold}`;
          const message = `Monitored value reached its threshold condition: ${condition}`;
          const notifyResponse = await fetch(`${SERVER_ADDRESS}/api/notifier?type=${notifier.value}`, {
            method: "POST",
            body: JSON.stringify({ receiver: user.email, name: monitor.parent, details: message }),
          });
          if (!notifyResponse.ok) {
            console.error(`Notification ERROR: ${await notifyResponse.json()}`);
            return;
          }
          updateSendTimestamp(user, monitor.parent);
          console.log(`Notification OK: ${await notifyResponse.json()}`);
        });
      } else {
        console.log(`${monitor.parent} does not meet its threshold value...`);
      }
    });
  } catch (err) {
    console.error("Worker error: ", err.message);
  }
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
