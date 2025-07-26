import { MonitorService } from "../model/MonitorService.js";

const INTERVAL = 60 * 1000;

async function checkData() {
  const enabledMonitors = await MonitorService.filterMonitors({ enabled: true });
  for (const monitor of enabledMonitors) {
    try {
      const response = await fetch(`http://localhost:3000/api/scraper/data?name=${monitor.parent}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${process.env.TEMP_TOKEN}` },
      });
      if (response.items[0].price > monitor.threshold) {
        console.log(`Sending notification: ${monitor.parent} over threshold!`);
      }
    } catch (err) {
      console.error("Worker error: ", err.message);
    }
  }
}

setInterval(checkData, INTERVAL);
checkData();
