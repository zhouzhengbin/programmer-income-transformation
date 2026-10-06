/* 拼图板自检 v2：用绝对路径打开 probe 页面，解析 <pre id="out">，并保留中间产物以便诊断 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const base = 'D:/omni-agent/projects/帮我写一个。-20261006-0652';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) { console.log('CHROME_MISSING'); process.exit(1); }

const probePath = path.join(base, '_probe_puzzle.html');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<iframe id="f" src="index.html" style="width:900px;height:900px;border:0"></iframe>
<pre id="out"></pre>
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
var f = document.getElementById('f');
f.onload = function(){
  setTimeout(function(){
    try {
      var w = f.contentWindow, d = f.contentDocument;
      post('omni', !!(w && w.OMNI));
      post('layout', !!(w && w.OMNI_LAYOUT));
      post('cells', d.querySelectorAll('.cell').length);
      w.OMNI.open('puzzle');
      setTimeout(function(){
        var cv = d.getElementById('cv');
        post('puzzleCanvas', !!cv);
        if (cv) {
          var r = cv.getBoundingClientRect();
          post('canvasSize', { w: Math.round(r.width), h: Math.round(r.height) });
          var sx = r.left + r.width * 0.15, sy = r.top + r.height * 0.35;
          var ex = r.left + r.width * 0.72, ey = r.top + r.height * 0.35;
          function fire(t, x, y){
            var ev = new PointerEvent(t, { bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:1, pointerType:'mouse' });
            cv.dispatchEvent(ev);
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
  }, 700);
};
</` + `script>
</body></html>`;

fs.writeFileSync(probePath, html, 'utf8');
const url = 'file:///' + probePath.replace(/\\/g, '/');
console.log('URL =', url);

const args = [chrome, '--headless=new', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
  '--window-size=1000,1000', '--virtual-time-budget=9000', '--dump-dom', url];
const r = cp.spawnSync(chrome, args, { encoding: 'utf8', timeout: 180000 });
const dom = r.stdout || '';
console.log('DOM_LEN =', dom.length);
const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
let parsed = null;
if (m) { try { parsed = JSON.parse(m[1].replace(/&quot;/g,'"')); } catch(e){ parsed = { parseError: m[1].slice(0,400) }; } }
console.log('HAS_RESULT =', !!m);
console.log('RESULT =', JSON.stringify(parsed, null, 2));
