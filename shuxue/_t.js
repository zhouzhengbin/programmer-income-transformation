const https = require("https");
const req = https.get("https://surge.surge.sh", {timeout: 20000}, res => {
  console.log("  surge.surge.sh HTTP", res.statusCode);
  res.destroy();
});
req.on("error", e => console.log("  ERR:", e.message.slice(0,120)));
req.on("timeout", () => { console.log("  TIMEOUT"); req.destroy(); });
