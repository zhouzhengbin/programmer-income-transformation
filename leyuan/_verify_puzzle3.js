/* 拼图板自检 v3：用 path.resolve 生成绝对路径的 file:// URL，并打印完整 stderr */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const base = path.resolve('D:\\omni-agent\\projects\\帮我写一个。-20261006-0652');
console.log('BASE =', base, fs.existsSync(base));

const cands = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];
const chrome = cands.find(c => fs.existsSync(c));
console.log('CHROME =', chrome);
if (!chrome) { console.log('CHROME_MISSING'); process.exit(1); }

const probePath = path.join(base, '_probe_puzzle.html');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<iframe id="f" src="index.html" style="width:900px;height:900px;border:0"></iframe>
<pre id="out">{}</pre>
<script>
window.__errs = [];
window.addEventListener('error', function(e){ window.__errs.push(String(e.message)); });
var _ce = console.error; console.error = function(){ window.__errs.push(Array.prototype.join.call(arguments,' ')); _ce.apply(console, arguments); };
function post(k, v){
  try {
    var o = JSON.parse(document.getElementById('out').textContent || '{}');
    o[k] = v;
    document.getElementById('out').textContent = JSON.stringify(o, null, 2);
  } catch(e) {}
}
window.__post = post;
var f = document.getElementById('f');
f.onload = function(){
  setTimeout(function(){
    try {
      var w = f.contentWindow, d = f.contentDocument;
      post('omni', !!(w && w.OMNI));
      post('layout', !!(w && w.OMNI_LAYOUT));
      post('cells', d.querySelectorAll('.cell').length);
      if (w && w.OMNI) w.OMNI.open('puzzle');
      setTimeout(function(){
        var cv = d.getElementById('cv');
        post('puzzleCanvas', !!cv);
        if (cv) {
          var r = cv.getBoundingClientRect();
          post('canvasSize', { w: Math.round(r.width), h: Math.round(r.height) });
          var sx = r.left + r.width * 0.15, sy = r.top + r.height * 0.35;
          var ex = r.left + r.width * 0.72, ey = r.top + r.height * 0.35;
          function fire(t, x, y){
            try {
              var ev = new PointerEvent(t, { bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:1, pointerType:'mouse' });
              cv.dispatchEvent(ev);
            } catch(e) { post('pointerError', String(e)); }
          }
          fire('pointerdown', sx, sy);
          fire('pointermove', sx + 30, sy);
          fire('pointermove', (sx+ex)/2, sy);
          fire('pointermove', ex, ey);
          fire('pointerup', ex, ey);
        }
        setTimeout(function(){
          post('errors', (f.contentWindow.__errs || []).concat(window.__errs));
          post('overflowX', f.contentDocument.documentElement.scrollWidth > f.contentWindow.innerWidth + 1);
          document.title = 'DONE';
        }, 500);
      }, 700);
    } catch (e) { post('exception', String(e)); document.title='DONE'; }
  }, 800);
};
</` + `script>
</body></html>`;

fs.writeFileSync(probePath, html, 'utf8');
const url = 'file:///' + probePath.replace(/\\/g, '/');
console.log('PROBE_URL =', url);
console.log('PROBE_EXISTS =', fs.existsSync(probePath));

const args = [chrome, '--headless=old', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
  '--window-size=1000,1000', '--virtual-time-budget=9000', '--dump-dom', '--no-pdf-header-footer', url];
const r = cp.spawnSync(chrome, args, { encoding: 'utf8', timeout: 180000 });
const dom = r.stdout || '';
console.log('EXIT =', r.status);
console.log('DOM_LEN =', dom.length);
console.log('STDERR_HEAD =', (r.stderr || '').slice(0, 400));
const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
let parsed = null;
if (m) { try { parsed = JSON.parse(m[1].replace(/&quot;/g,'"')); } catch(e){ parsed = { parseError: m[1].slice(0,400) }; } }
console.log('HAS_RESULT =', !!m);
console.log('RESULT =', JSON.stringify(parsed, null, 2));
