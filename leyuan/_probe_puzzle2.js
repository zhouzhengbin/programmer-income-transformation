/* CDP 直连方案（不依赖 ws 库）：启动 headless Chrome -> HTTP 拿 webSocketDebuggerUrl -> 用 Node 内建 WebSocket（Node 22+）或 undici 发 Runtime.evaluate */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const base = path.resolve(__dirname);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) { console.log('CHROME_MISSING'); process.exit(1); }

const url = 'file:///' + path.join(base, 'index.html').replace(/\\/g, '/');
const port = 9334;
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
      if (tries > 80) return rej(new Error('devtools timeout'));
      getJson('/json/version').then(res).catch(function () { setTimeout(tick, 250); });
    })();
  });
}

async function main() {
  await waitForDevtools();
  const targets = await getJson('/json/list');
  const page = targets.find(function (t) { return t.type === 'page'; });
  if (!page) { console.log('NO_PAGE'); proc.kill(); return; }
  const wsUrl = page.webSocketDebuggerUrl;
  console.log('WS_URL =', wsUrl);

  /* Node 22+ 自带 WebSocket；否则尝试 undici */
  let WS = null;
  if (typeof WebSocket === 'function') WS = WebSocket;
  else { try { WS = require('undici').WebSocket; } catch (e) { WS = null; } }
  if (!WS) { console.log('NO_WS_IMPL'); proc.kill(); return; }

  const ws = new WS(wsUrl);
  await new Promise(function (res, rej) { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = function (ev) {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  function send(method, params) {
    return new Promise(function (res) {
      const myId = ++id;
      pending.set(myId, res);
      ws.send(JSON.stringify({ id: myId, method: method, params: params || {} }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: url });
  await new Promise(function (r) { setTimeout(r, 1800); });

  const probe1 = `(function(){
    var out = { errs: window.__errs || [], omni: !!window.OMNI, layout: !!window.OMNI_LAYOUT };
    out.cells = document.querySelectorAll('.cell').length;
    try { window.OMNI.open('puzzle'); } catch(e) { out.openErr = String(e); }
    return out;
  })()`;
  const r1 = await send('Runtime.evaluate', { expression: probe1, returnByValue: true });
  await new Promise(function (r) { setTimeout(r, 800); });

  const probe2 = `(function(){
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
      var sx = r.left + r.width * 0.12, sy = r.top + r.height * 0.30;
      var ex = r.left + r.width * 0.72, ey = r.top + r.height * 0.30;
      fire('pointerdown', sx, sy);
      fire('pointermove', sx + 20, sy);
      fire('pointermove', (sx + ex)/2, sy);
      fire('pointermove', ex, ey);
      fire('pointerup', ex, ey);
      out.fired = true;
    }
    return out;
  })()`;
  const r2 = await send('Runtime.evaluate', { expression: probe2, returnByValue: true });
  await new Promise(function (r) { setTimeout(r, 600); });

  const payload = {
    step1: r1 && r1.result && r1.result.value,
    step2: r2 && r2.result && r2.result.value
  };
  console.log('RESULT =', JSON.stringify(payload, null, 2));
  try {
    fs.writeFileSync(path.join(base, 'VERIFY_PUZZLE.json'), JSON.stringify(payload, null, 2));
  } catch (e) {}

  try { ws.close(); } catch (e) {}
  proc.kill();
}

main().catch(function (e) { console.log('ERR =', String(e)); try { proc.kill(); } catch (e2) {} });
