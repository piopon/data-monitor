import { MonitorService } from "../model/MonitorService.js";
import waitOn from "wait-on";

const INTERVAL = 60_000;

async function checkData() {
  try {
    const scraperResponse = await fetch(`http://localhost:3000/api/scraper/data`, {
      method: "GET",
      headers: { Authorization: `Bearer ${process.env.TEMP_TOKEN}` },
    });
    if (!scraperResponse.ok) {
      console.error("Worker error: ", await scraperResponse.text());
      return;
    }
    const scraperData = await scraperResponse.json();
    const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
    enabledMonitors.forEach(monitor => {
      const items = scraperData
        .flatMap((element) => element.items)
        .filter((item) => item.name.toLowerCase().replace(/\s+/g, "-") === monitor.parent);
      if (items.length !== 1) {
        console.error(`Worker error: cannot find ${monitor.parent} in scraper data...`);
        return;
      }
      const verify = (val1, operator, val2) => {
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
      };
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
