require("dotenv").config();
const fs = require("fs");
const path = require("path");

const POLYMARKET_USER = process.env.POLYMARKET_USER;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "60000", 10);
const ALERT_THRESHOLD = parseFloat(process.env.ALERT_THRESHOLD || "0.05");
const DATA_FILE = path.join(__dirname, "prices.json");

let lastPrices = {}; // { [asset]: price }

function loadPrices() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8");
      lastPrices = JSON.parse(data);
      console.log("Loaded prices from disk:", Object.keys(lastPrices).length, "assets");
    } else {
      console.log("No saved prices found, starting fresh");
    }
  } catch (err) {
    console.error("Error loading prices:", err.message);
    lastPrices = {};
  }
}

function savePrices() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(lastPrices, null, 2));
  } catch (err) {
    console.error("Error saving prices:", err.message);
  }
}

async function fetchPositions() {
  const res = await fetch(
    `https://data-api.polymarket.com/positions?user=${POLYMARKET_USER}&sizeThreshold=1`
  );
  return res.json();
}

async function sendTelegram(message) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "HTML" }),
  });
}

async function checkPositions() {
  const positions = await fetchPositions();

  for (const pos of positions) {
    const { asset, curPrice, title, outcome, size } = pos;
    const prev = lastPrices[asset];

    if (prev !== undefined) {
      const change = (curPrice - prev) / prev;
      const delta = (curPrice - prev);
      // console.log(`change: ${change}, delta: ${delta}`)

      if (Math.abs(delta) >= ALERT_THRESHOLD) {
        const dir = change > 0 ? "🟢 UP" : "🔴 DOWN";
        const pct = (change * 100).toFixed(1);
        const msg =
          `<b>${dir} ${pct}%</b>\n` +
          `📊 <b>${title}</b>\n` +
          `Outcome: ${outcome}\n` +
          `Price: ${prev.toFixed(3)} → ${curPrice.toFixed(3)}\n` +
          `Your size: ${size.toFixed(0)} shares`;

        await sendTelegram(msg);
      }
    }

    lastPrices[asset] = curPrice;
  }

  savePrices();
}

// Run loop
(async () => {
  console.log("Starting position tracker...");
  loadPrices();
  await checkPositions();
  setInterval(checkPositions, POLL_INTERVAL_MS);
})();

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down... Saving prices...");
  savePrices();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Saving prices...");
  savePrices();
  process.exit(0);
});

