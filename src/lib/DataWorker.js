import { MonitorService } from "../model/MonitorService.js";
import { DataUtils } from "./DataUtils.js";
import waitOn from "wait-on";

const INTERVAL = 60_000;

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
 */
async function checkData() {
  try {
    const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
    enabledMonitors.forEach(async (monitor) => {
      const scraperResponse = await fetch(`http://localhost:3000/api/scraper/items?name=${monitor.parent}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.TEMP_TOKEN}` },
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
      if (verify(parseFloat(items[0].price), monitor.condition, parseFloat(monitor.threshold))) {
        console.log(`Sending notification: ${monitor.parent} over threshold!`);
      } else {
        console.log(`${monitor.parent} does not meet its threshold yet ...`);
      }
    });
  } catch (err) {
    console.error("Worker error: ", err.message);
  }
}

//wait for Next.js server to be up and running before getting data
await waitOn({ delay: 5000, interval: 1000, resources: ["http://localhost:3000"] });

setInterval(checkData, INTERVAL);
checkData();
