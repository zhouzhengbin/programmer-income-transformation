/* 用 CDP（Chrome DevTools Protocol）直连 headless Chrome：避免 --dump-dom 的多 target 限制
 * 步骤：启动 headless chrome --remote-debugging-port -> 通过 WebSocket 发 Runtime.evaluate -> 打印断言结果
 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const base = path.resolve(__dirname);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) { console.log('CHROME_MISSING'); process.exit(1); }

const url = 'file:///' + path.join(base, 'index.html').replace(/\\/g, '/');
const port = 9333;
const args = [
  '--headless=old', '--disable-gpu', '--no-sandbox',
  '--allow-file-access-from-files', '--remote-debugging-port=' + port,
  '--window-size=1000,1000', 'about:blank'
];

const proc = cp.spawn(chrome, args, { stdio: 'ignore' });

function getJson(pathname) {
  return new Promise(function (res, rej) {
    http.get({ host: '127.0.0.1', port: port, path: pathname }, function (r) {
      let body = '';
      r.on('data', function (c) { body += c; });
      r.on('end', function () { try { res(JSON.parse(body)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

function waitForDevtools() {
  return new Promise(function (res, rej) {
    let tries = 0;
    (function tick() {
      tries++;
      if (tries > 60) return rej(new Error('devtools timeout'));
      getJson('/json/version').then(function () { res(); }).catch(function () { setTimeout(tick, 200); });
    })();
  });
}

const WS = require('fs').existsSync(path.join(base, 'node_modules', 'ws')) ? require('ws') : null;

async function main() {
  await waitForDevtools();
  const targets = await getJson('/json/list');
  const page = targets.find(t => t.type === 'page');
  if (!page) { console.log('NO_PAGE'); proc.kill(); return; }
  if (!WS) { console.log('WS_LIB_MISSING'); proc.kill(); return; }
  const ws = new WS(page.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));
  let id = 0;
  function send(method, params) {
    return new Promise(function (res) {
      const myId = ++id;
      function onMsg(raw) {
        const m = JSON.parse(raw);
        if (m.id === myId) { ws.off('message', onMsg); res(m); }
      }
      ws.on('message', onMsg);
      ws.send(JSON.stringify({ id: myId, method: method, params: params || {} }));
    });
  }
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: url });
  await new Promise(r => setTimeout(r, 1500));
  const probe = `
(function(){
  var out = { errs: window.__errs || [] };
  out.omni = !!window.OMNI;
  out.cells = document.querySelectorAll('.cell').length;
  try {
    window.OMNI.open('puzzle');
  } catch(e) { out.openErr = String(e); }
  return out;
})()`;
  const r1 = await send('Runtime.evaluate', { expression: probe, returnByValue: true });
  await new Promise(r => setTimeout(r, 700));
  const probe2 = `
(function(){
  var cv = document.getElementById('cv');
  var r = cv ? cv.getBoundingClientRect() : null;
  var out = {
    puzzleCanvas: !!cv,
    canvasSize: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    errs: window.__errs || []
  };
  if (cv) {
    function fire(t, x, y) {
      var ev = new PointerEvent(t, { bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId:1, pointerType:'mouse' });
      cv.dispatchEvent(ev);
    }
    var sx = r.left + r.width * 0.15;
    var sy = r.top + r.height * 0.35;
    var ex = r.left + r.width * 0.72;
    var ey = r.top + r.height * 0.35;
    fire('pointerdown', sx, sy);
    fire('pointermove', sx + 30, sy);
    fire('pointermove', (sx + ex)/2, sy);
    fire('pointermove', ex, ey);
    fire('pointerup', ex, ey);
    out.fired = true;
  }
  return out;
})()`;
  const r2 = await send('Runtime.evaluate', { expression: probe2, returnByValue: true });
  await new Promise(r => setTimeout(r, 500));
  console.log('STEP1 =', JSON.stringify(r1 && r1.result && r1.result.value, null, 2));
  console.log('STEP2 =', JSON.stringify(r2 && r2.result && r2.result.value, null, 2));
  try { fs.writeFileSync(path.join(base, 'VERIFY_PUZZLE.json'), JSON.stringify({ step1: r1 && r1.result && r1.result.value, step2: r2 && r2.result && r2.result.value }, null, 2)); } catch (e) {}
  ws.close();
  proc.kill();
}

main().catch(function (e) { console.log('ERR =', String(e)); proc.kill(); });
