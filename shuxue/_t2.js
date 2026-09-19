const https = require("https");
const req = https.get("https://registry.npmmirror.com", {timeout: 15000}, res => {
  console.log("  npmmirror HTTP", res.statusCode);
  res.destroy();
});
req.on("error", e => console.log("  ERR:", e.message.slice(0,120)));
