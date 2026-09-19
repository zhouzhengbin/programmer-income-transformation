const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const D = "C:\\Users\\86139\\Documents\\ChatGPT\\小二算数";
const ZIP = path.join(D, "_netlify_drop.zip");
const OUT = path.join(D, "_netlify_result.json");

function req(method, url, body, headers, cb) {
  const u = new URL(url);
  const opts = { method, hostname: u.hostname, path: u.pathname + u.search,
    headers: Object.assign({"User-Agent":"Mozilla/5.0"}, headers||{}), timeout: 120000 };
  const r = https.request(opts, res => {
    let chunks = [];
    res.on("data", c => chunks.push(c));
    res.on("end", () => cb(null, res.statusCode, Buffer.concat(chunks)));
  });
  r.on("error", e => cb(e));
  r.on("timeout", () => { r.destroy(); cb(new Error("timeout")); });
  if(body) r.write(body);
  r.end();
}

console.log("=== 1. 匿名建站 ===");
req("POST", "https://api.netlify.com/api/v1/sites", "{}", {"Content-Type":"application/json"}, (e, code, buf) => {
  if(e){ console.log("  ERR:", e.message); process.exit(1); }
  console.log("  HTTP", code);
  console.log("  body:", buf.toString().slice(0,400));
  if(code !== 200 && code !== 201){ console.log("  建站失败"); process.exit(1); }
  const site = JSON.parse(buf.toString());
  console.log("  site_id:", site.id);
  console.log("  subdomain:", site.subdomain);
  console.log("  ssl_url:", site.ssl_url);
  fs.writeFileSync(path.join(D,"_netlify_site.json"), JSON.stringify(site,null,2));

  console.log("\n=== 2. 上传 zip ===");
  const zipBuf = fs.readFileSync(ZIP);
  console.log("  zip size:", zipBuf.length);
  req("POST", "https://api.netlify.com/api/v1/sites/"+site.id+"/deploys", zipBuf,
      {"Content-Type":"application/zip","Content-Length":zipBuf.length}, (e2, code2, buf2) => {
    if(e2){ console.log("  ERR:", e2.message); process.exit(1); }
    console.log("  HTTP", code2);
    const txt = buf2.toString();
    console.log("  body:", txt.slice(0,500));
    if(code2 === 200 || code2 === 201){
      const dep = JSON.parse(txt);
      console.log("\n  ✅ 部署成功！");
      console.log("  state:", dep.state);
      console.log("  deploy_url:", dep.ssl_url || dep.url);
      fs.writeFileSync(OUT, JSON.stringify(dep,null,2));
    }
  });
});
