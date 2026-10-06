/* CDP 直连 v3：probe 表达式改回 JSON.stringify(...) 字符串，Node 端 JSON.parse，拿到真实断言值 */
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const base = path.resolve(__dirname);
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(chrome)) { console.log('CHROME_MISSING'); process.exit(1); }

const url = 'file:///' + path.join(base, 'index.html').replace(/\\/g, '/');
const port = 9335;
const proc = cp.spawn(chrome, [
  '--headless=old', '--disable-gpu', '--no-sandbox',
  '--allow-file-access-from-files', '--remote-debugging-port=' + port,
  '--window-size=1000,1000', 'about:blank'
], { stdio: 'ignore' });

function getJson(pathname) {
  return new Promise(function (res, rej) {
    http.get({ host: '127.0.0.1', port: port, path: pathname }, function (r) {
      let body = '';
      r.on('data', function (c) { body += c; });
      r.on('end', function () { try { res(JSON.parse(body)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

function waitDevtools() {
  return new Promise(function (res, rej) {
    let n = 0;
    (function tick() {
      n++;
      if (n > 80) return rej(new Error('devtools timeout'));
      getJson('/json/version').then(res).catch(function () { setTimeout(tick, 250); });
    })();
  });
}

async function main() {
  await waitDevtools();
  const targets = await getJson('/json/list');
  const page = targets.find(function (t) { return t.type === 'page'; });
  if (!page) { console.log('NO_PAGE'); proc.kill(); return; }

  let WS = (typeof WebSocket === 'function') ? WebSocket : null;
  if (!WS) { try { WS = require('undici').WebSocket; } catch (e) { WS = null; } }
  if (!WS) { console.log('NO_WS_IMPL'); proc.kill(); return; }

  const ws = new WS(page.webSocketDebuggerUrl);
  await new Promise(function (res, rej) { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = function (ev) {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  function send(method, params) {
    return new Promise(function (res) {
      const my = ++id;
      pending.set(my, res);
      ws.send(JSON.stringify({ id: my, method: method, params: params || {} }));
    });
  }
  async function evaluate(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    const v = r && r.result && r.result.value;
    if (typeof v === 'string') { try { return JSON.parse(v); } catch (e) { return v; } }
    return v;
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: url });
  await new Promise(function (r) { setTimeout(r, 2000); });

  const step1 = await evaluate(`JSON.stringify((function(){
    var out = { errs: window.__errs || [], omni: !!window.OMNI, layout: !!window.OMNI_LAYOUT };
    out.cells = document.querySelectorAll('.cell').length;
    out.bgCanvas = !!document.getElementById('bg');
    out.fxCanvas = !!document.getElementById('fx');
    out.hero = !!document.getElementById('heroCanvas');
    try { window.OMNI.open('puzzle'); } catch(e) { out.openErr = String(e); }
    return out;
  })())`);
  await new Promise(function (r) { setTimeout(r, 900); });

  const step2 = await evaluate(`JSON.stringify((function(){
    var cv = document.getElementById('cv');
    var r = cv ? cv.getBoundingClientRect() : null;
    var out = {
      puzzleCanvas: !!cv,
      canvasSize: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
      stageW: window.OMNI_LAYOUT ? window.OMNI_LAYOUT.get().w : null,
      stageH: window.OMNI_LAYOUT ? window.OMNI_LAYOUT.get().h : null,
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
  })())`);
  await new Promise(function (r) { setTimeout(r, 700); });

  const step3 = await evaluate(`JSON.stringify((function(){
    var cv = document.getElementById('cv');
    var r = cv ? cv.getBoundingClientRect() : null;
    var out = {
      hintText: (document.getElementById('hint') || {}).textContent || null,
      errs: window.__errs || []
    };
    /* 若拼图实现了对外状态，尝试读取 */
    if (window.__game && window.__game.puzzle) {
      out.puzzleState = window.__game.puzzle;
    } else {
      out.puzzleState = null;
    }
    return out;
  })())`);

  const payload = { step1: step1, step2: step2, step3: step3 };
  console.log('RESULT =', JSON.stringify(payload, null, 2));
  fs.writeFileSync(path.join(base, 'VERIFY_PUZZLE.json'), JSON.stringify(payload, null, 2), 'utf8');

  try { ws.close(); } catch (e) {}
  proc.kill();
}

main().catch(function (e) { console.log('ERR =', String(e)); try { proc.kill(); } catch (e2) {} });
