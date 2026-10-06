/* 大画笔 v2：颜色 / 粗细 / 橡皮擦 / 清空 / 撤销 / 重做；尺寸由 layout 驱动 */
(function (g) {
  'use strict';
  g.OMNI_GAMES = g.OMNI_GAMES || {};
  g.OMNI_GAMES.paint = function (box, api) {
    box.innerHTML =
      '<div class="playWrap"><canvas class="play" id="cv"></canvas></div>' +
      '<div class="btns" id="palette"></div>' +
      '<div class="hint" id="hint">按住画；点工具切橡皮/撤销/清空</div>';

    var cv = box.querySelector('#cv'), ctx = cv.getContext('2d');
    var SIDE = 320;
    var BG = '#fff8ee';
    var color = '#ff7fb6', size = 14, drawing = false, prev = null;
    var eraser = false;
    var strokes = 0;
    /* 历史记录：每条是一组笔迹段，撤销/重做以段为单位 */
    var history = [];
    var redo = [];
    var MAX_HISTORY = 20;

    function layoutCanvas(preserve) {
      var m = (g.OMNI_LAYOUT && g.OMNI_LAYOUT.get()) || null;
      var W, H;
      if (m) { W = m.w; H = m.h; } else { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; }
      SIDE = Math.max(240, Math.min(W - 12, H - 110));
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      /* 保存现有画面 */
      var snap = null;
      if (preserve && cv.width && cv.height) {
        try {
          snap = document.createElement('canvas');
          snap.width = cv.width; snap.height = cv.height;
          snap.getContext('2d').drawImage(cv, 0, 0);
        } catch (e) { snap = null; }
      }
      cv.width = SIDE * dpr; cv.height = SIDE * dpr;
      cv.style.width = SIDE + 'px'; cv.style.height = SIDE + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, SIDE, SIDE);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (snap) ctx.drawImage(snap, 0, 0, SIDE, SIDE);
    }

    /* 按历史栈重绘整块画布（撤销/重做/清空后调用） */
    function redrawFromHistory() {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, SIDE, SIDE);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      history.forEach(function (stroke) {
        stroke.forEach(function (seg) {
          ctx.strokeStyle = seg.isEraser ? BG : seg.color;
          ctx.lineWidth = seg.size;
          ctx.beginPath(); ctx.moveTo(seg.a.x, seg.a.y); ctx.lineTo(seg.b.x, seg.b.y); ctx.stroke();
        });
      });
    }

    function pushHistory(stroke) {
      history.push(stroke);
      if (history.length > MAX_HISTORY) history.shift();
      redo.length = 0;
    }

    function setHint(t) { box.querySelector('#hint').textContent = t; }

    /* ===== 工具条 ===== */
    var pal = box.querySelector('#palette');
    var colors = ['#ff7fb6', '#ffc94d', '#66d4ff', '#41c98a', '#b388ff', '#1d3a5f'];
    colors.forEach(function (c) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', '颜色 ' + c);
      b.style.background = c; b.style.width = '44px'; b.style.height = '44px';
      b.style.borderRadius = '50%'; b.style.padding = '0'; b.style.border = '3px solid #fff';
      b.onclick = function () { color = c; eraser = false; api.sfx && api.sfx.pick(); setHint('画 ' + c); };
      pal.appendChild(b);
    });

    function mkBtn(label, cls, aria, onClick) {
      var b = document.createElement('button');
      b.textContent = label;
      b.className = cls || 'ghost';
      b.setAttribute('aria-label', aria || label);
      b.style.padding = '10px 14px';
      b.onclick = onClick;
      pal.appendChild(b);
      return b;
    }

    mkBtn('橡皮', 'ghost', '橡皮擦', function () {
      eraser = !eraser;
      api.sfx && api.sfx.pick();
      setHint(eraser ? '橡皮模式' : ('画 ' + color));
    });
    mkBtn('清空', 'ghost', '清空画布', function () {
      if (!history.length) return;
      history = []; redo = []; strokes = 0;
      redrawFromHistory();
      api.sfx && api.sfx.pick();
      setHint('已清空（可点撤销恢复）');
      window.__paintState = { strokes: 0, size: SIDE, canUndo: false, canRedo: false };
    });
    mkBtn('撤销', 'ghost', '撤销上一笔', function () {
      if (!history.length) { setHint('没有可撤销的笔迹'); return; }
      redo.push(history.pop());
      strokes = Math.max(0, strokes - 1);
      redrawFromHistory();
      api.sfx && api.sfx.pick();
      setHint('已撤销，剩 ' + history.length + ' 笔');
      window.__paintState = { strokes: history.length, size: SIDE, canUndo: history.length > 0, canRedo: redo.length > 0 };
    });
    mkBtn('重做', 'ghost', '重做', function () {
      if (!redo.length) { setHint('没有可重做的笔迹'); return; }
      history.push(redo.pop());
      strokes++;
      redrawFromHistory();
      api.sfx && api.sfx.pick();
      setHint('已重做，共 ' + history.length + ' 笔');
      window.__paintState = { strokes: history.length, size: SIDE, canUndo: history.length > 0, canRedo: redo.length > 0 };
    });
    mkBtn('粗细', 'ghost', '粗细', function () {
      size = size === 14 ? 26 : (size === 26 ? 6 : 14);
      api.toast('笔 ' + size + 'px');
    });

    /* ===== 输入 ===== */
    var currentStroke = null;

    function pos(ev) { var r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }

    function drawSeg(seg) {
      ctx.strokeStyle = seg.isEraser ? BG : seg.color;
      ctx.lineWidth = seg.size;
      ctx.beginPath(); ctx.moveTo(seg.a.x, seg.a.y); ctx.lineTo(seg.b.x, seg.b.y); ctx.stroke();
      if (!seg.isEraser) {
        for (var i = 0; i < 2; i++) {
          ctx.globalAlpha = .55;
          ctx.fillStyle = seg.color;
          ctx.beginPath();
          ctx.arc(seg.b.x + (Math.random() - .5) * 20, seg.b.y + (Math.random() - .5) * 20, 1 + Math.random() * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    cv.addEventListener('pointerdown', function (ev) {
      drawing = true; prev = pos(ev);
      currentStroke = [];
      cv.setPointerCapture && cv.setPointerCapture(ev.pointerId);
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!drawing) return;
      var p = pos(ev);
      var seg = { a: prev, b: p, color: color, size: size, isEraser: eraser };
      drawSeg(seg);
      currentStroke.push(seg);
      prev = p;
    });
    cv.addEventListener('pointerup', function () {
      if (!drawing) return;
      drawing = false;
      if (currentStroke && currentStroke.length) {
        pushHistory(currentStroke);
        strokes++;
        var r = cv.getBoundingClientRect();
        api.gain(1, r.left + SIDE / 2, r.top + SIDE / 2, '第 ' + strokes + ' 笔');
        window.__paintState = { strokes: history.length, size: SIDE, canUndo: true, canRedo: false };
      }
      currentStroke = null;
    });
    cv.addEventListener('pointercancel', function () { drawing = false; currentStroke = null; });
    cv.addEventListener('pointerleave', function () { drawing = false; });

    layoutCanvas(false);
    window.__paintState = { strokes: 0, size: SIDE, canUndo: false, canRedo: false };
    if (g.OMNI_LAYOUT) g.OMNI_LAYOUT.on(function () { layoutCanvas(true); });
    window.addEventListener('resize', function () { layoutCanvas(true); }, { passive: true });
  };
})(window);
