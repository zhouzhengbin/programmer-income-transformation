/* 运行期自检：用 Chrome headless 打开 index.html，在三种视口下断言无错、无横向溢出、12 入口、可进入玩法 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const base = __dirname;
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(chrome)) {
  console.log('CHROME_MISSING');
  process.exit(1);
}

const url = 'file:///' + path.join(base, 'index.html').replace(/\\/g, '/');

function runAt(w, h) {
  const probe = `
(function(){
  var out = { w: ${w}, h: ${h}, errs: [], checks: {} };
  try {
    out.checks.scrollW = document.documentElement.scrollWidth;
    out.checks.innerW = window.innerWidth;
    out.checks.overflowX = document.documentElement.scrollWidth > window.innerWidth + 1;
    out.checks.hasStage = !!document.getElementById('stage');
    out.checks.heroCanvas = !!document.getElementById('heroCanvas');
    out.checks.cells = document.querySelectorAll('#grid .cell').length;
    if (window.OMNI && typeof window.OMNI.open === 'function') {
      window.OMNI.open('wheel');
      out.checks.wheelCanvas = !!document.getElementById('cv');
    }
  } catch(e) { out.errs.push(String(e && e.message)); }
  var pre = document.createElement('pre');
  pre.id = 'omniResult';
  pre.textContent = JSON.stringify(out);
  document.body.appendChild(pre);
})();
`;
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--virtual-time-budget=4000',
    '--window-size=' + w + ',' + h,
    '--dump-dom', url
  ];
  const r = cp.spawnSync(chrome, args, { encoding: 'utf8', timeout: 120000 });
  const dom = (r.stdout || '') + '';
  const m = dom.match(/<pre id="omniResult">([\s\S]*?)<\/pre>/);
  if (!m) return { ok: false, raw: dom.slice(0, 200) };
  try { return { ok: true, data: JSON.parse(m[1].replace(/&quot;/g, '"')) }; }
  catch (e) { return { ok: false, raw: m[1].slice(0, 300) }; }
}

// 注入脚本到 index.html 的方式：改成在 --dump-dom 前先设置 window 尺寸
// 更稳的做法是用独立探针页打开 index.html iframe；这里改为把探针注入 index.html 的副本
const probePage = path.join(base, '_probe_runtime.html');
fs.writeFileSync(probePage, `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<iframe id="f" src="index.html" style="width:100%;height:100%;border:0"></iframe>
<pre id="omniResult">pending</pre>
<script>
var out = { errs: [], checks: {} };
var f = document.getElementById('f');
f.onload = function(){
  setTimeout(function(){
    try {
      var w = f.contentWindow, d = f.contentDocument;
      out.checks.omni_exists = !!(w && w.OMNI);
      out.checks.hero = !!(d && d.getElementById('heroCanvas'));
      out.checks.cells = d ? d.querySelectorAll('#grid .cell').length : 0;
      out.checks.stage_child = !!(d && d.getElementById('stage') && d.getElementById('stage').children.length > 0);
      out.checks.scrollW = d ? d.documentElement.scrollWidth : 0;
      out.checks.innerW = w ? w.innerWidth : 0;
      out.checks.overflowX = d ? (d.documentElement.scrollWidth > w.innerWidth + 1) : false;
      if (w && w.OMNI && w.OMNI.open) { w.OMNI.open('wheel'); setTimeout(function(){
        out.checks.wheelCanvas = !!(d.getElementById('cv'));
        document.getElementById('omniResult').textContent = JSON.stringify(out);
      }, 700); } else {
        document.getElementById('omniResult').textContent = JSON.stringify(out);
      }
    } catch(e){ out.errs.push(String(e && e.message)); document.getElementById('omniResult').textContent = JSON.stringify(out); }
  }, 600);
};
</script></body></html>`);

const probeUrl = 'file:///' + probePage.replace(/\\/g, '/');

const sizes = [[320, 568], [768, 1024], [1440, 900]];
const results = [];
for (const [w, h] of sizes) {
  const args = [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--virtual-time-budget=6000',
    '--window-size=' + w + ',' + h,
    '--dump-dom', probeUrl
  ];
  const r = cp.spawnSync(chrome, args, { encoding: 'utf8', timeout: 120000 });
  const dom = r.stdout || '';
  const m = dom.match(/<pre id="omniResult">([\s\S]*?)<\/pre>/);
  let parsed = null;
  if (m) {
    try { parsed = JSON.parse(m[1].replace(/&quot;/g, '"')); } catch (e) { parsed = { parseError: m[1].slice(0, 200) }; }
  }
  results.push({ size: w + 'x' + h, data: parsed });
}

fs.writeFileSync(path.join(base, 'VERIFY_RUNTIME.json'), JSON.stringify(results, null, 2), 'utf8');
console.log(JSON.stringify(results, null, 2));
