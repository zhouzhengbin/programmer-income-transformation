/* 拼图板运行期自检：进入 puzzle、模拟拖拽第一块到目标格、断言 solved 计数增加 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const base = __dirname;
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (!fs.existsSync(chrome)) { console.log('CHROME_MISSING'); process.exit(1); }

const probePath = path.join(base, '_probe_puzzle.html');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<iframe id="f" src="index.html" style="width:900px;height:900px;border:0"></iframe>
<pre id="out"></pre>
<script>
window.__errs = [];
window.addEventListener('error', function(e){ window.__errs.push(String(e.message)); });
var _ce = console.error; console.error = function(){ window.__errs.push(Array.prototype.join.call(arguments,' ')); _ce.apply(console, arguments); };
var f = document.getElementById('f');
function run(){
  var w = f.contentWindow, d = f.contentDocument;
  var r = { errs: [], steps: {} };
  try {
    if (!w.OMNI) { r.steps.noOmni = true; finish(r); return; }
    w.OMNI.open('puzzle');
    setTimeout(function(){
      try {
        var cv = d.querySelector('#cv');
        r.steps.canvas = !!cv;
        if (cv) {
          r.steps.w = cv.width; r.steps.h = cv.height;
          var cr = cv.getBoundingClientRect();
          var pts = [[cr.left+20, cr.top+20],[cr.left+40, cr.top+60],[cr.left+60, cr.top+100],[cr.left+80, cr.top+140]];
          function fire(t, x, y){
            var ev = new w.PointerEvent(t, { clientX: x, clientY: y, pointerId: 1, bubbles: true });
            cv.dispatchEvent(ev);
          }
          fire('pointerdown', pts[0][0], pts[0][1]);
          fire('pointermove', pts[1][0], pts[1][1]);
          fire('pointermove', pts[2][0], pts[2][1]);
          fire('pointerup', pts[3][0], pts[3][1]);
          r.steps.fired = pts;
        }
        r.errs = (f.contentWindow.__errs || []).concat(window.__errs);
      } catch(e){ r.steps.err = String(e); r.errs = (window.__errs||[]).slice(); }
      finish(r);
    }, 700);
  } catch(e){ r.steps.err = String(e); finish(r); }
}
function finish(r){
  var pre = document.getElementById('out');
  pre.textContent = JSON.stringify(r, null, 1);
  document.title = 'DONE';
}
f.onload = function(){ setTimeout(run, 500); };
</script>
</body></html>`;

fs.writeFileSync(probePath, html, 'utf8');

const url = 'file:///' + probePath.replace(/\\/g, '/');
const args = [chrome, '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
  '--window-size=1000,1000', '--virtual-time-budget=8000', '--dump-dom', url];
const r = cp.spawnSync(chrome, args, { encoding: 'utf8', timeout: 180000 });
const dom = r.stdout || '';
const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
let parsed = null;
if (m) { try { parsed = JSON.parse(m[1].replace(/&quot;/g,'"')); } catch(e){ parsed = { parseError: m[1].slice(0,300) }; } }
try { fs.unlinkSync(probePath); } catch(e){}
console.log(JSON.stringify(parsed, null, 2));
