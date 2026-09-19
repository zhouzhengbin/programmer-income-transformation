const https = require("https");
const req = https.get("https://api.netlify.com/api/v1/sites", {timeout: 15000, headers:{"User-Agent":"Mozilla/5.0"}}, res => {
  console.log("  netlify API HTTP", res.statusCode);
  res.destroy();
});
req.on("error", e => console.log("  ERR:", e.message.slice(0,120)));
