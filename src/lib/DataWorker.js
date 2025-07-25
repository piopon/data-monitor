const INTERVAL = 60 * 1000;

async function checkPrices() {
  console.log("worker checking in...");
}

setInterval(checkPrices, INTERVAL);
checkPrices();
