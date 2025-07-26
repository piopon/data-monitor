import { MonitorService } from "../model/MonitorService.js";
import waitOn from "wait-on";

const INTERVAL = 60_000;

async function checkData() {
  const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
  for (const monitor of enabledMonitors) {
    try {
      const response = await fetch(`http://localhost:3000/api/scraper/data`, {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.TEMP_TOKEN}` },
      });
      const data = await response.json();
      const items = data
        .flatMap((element) => element.items)
        .filter((item) => item.name.toLowerCase().replace(/\s+/g, "-") === monitor.parent);
      if (items.length !== 1) {
        console.error(`Worker error: cannot find ${monitor.parent} in scraper data...`);
        return;
      }
      if (parseFloat(items[0].price) > parseFloat(monitor.threshold)) {
        console.log(`Sending notification: ${monitor.parent} over threshold!`);
      } else {
        console.log(`${monitor.parent} does not meet its threshold yet ...`);
      }
    } catch (err) {
      console.error("Worker error: ", err.message);
    }
  }
}

//wait for Next.js server to be up and running before getting data
await waitOn({ delay: 5000, interval: 1000, resources: ["http://localhost:3000"] });

setInterval(checkData, INTERVAL);
checkData();
