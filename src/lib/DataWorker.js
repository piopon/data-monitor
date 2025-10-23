import { Monitor } from "../model/Monitor.js";
import { MonitorService } from "../model/MonitorService.js";
import { UserService } from "../model/UserService.js";
import waitOn from "wait-on";

const INTERVAL = process.env.CHECK_INTERVAL || 60_000;
const DELAY = process.env.CHECK_DELAY || 5_000;
const WAIT = process.env.CHECK_WAIT || 1_000;
const SERVER_ADDRESS = `http://${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;

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
 * Main worker method used to check scraper data against threshold
 * @param {String} userJwt Parent's user JSON web token value (needed to retrieve data)
 */
async function checkData(userJwt) {
  try {
    const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
    enabledMonitors.forEach(async (monitor) => {
      // get scraper data item value for specified user's enabled monitor
      const scraperResponse = await fetch(`${SERVER_ADDRESS}/api/scraper/items?name=${monitor.parent}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${userJwt}` },
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
        console.log(`Sending notification: ${monitor.parent} over threshold!`);
        Monitor.NOTIFIERS.filter((notifier) => monitor.notifier === notifier.value).forEach((notifier) => {
          const res = notifier.handler.notify({ receiver: "", name: monitor.parent, details: "TEST" });
          console.log(res.info);
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
// start data check logic for each user in database with appropriate delay
UserService.getUsers()
  .then((users) => {
    users.forEach((user, index) => {
      sleep((INTERVAL / 10) * index).then(() => {
        console.log(`Worker info: started for user ${user.email}`);
      });
      setInterval(checkData, INTERVAL, user.jwt);
      checkData(user.jwt);
    });
  })
  .catch((error) => console.error(`Worker error: cannot get users: ${error}`));
