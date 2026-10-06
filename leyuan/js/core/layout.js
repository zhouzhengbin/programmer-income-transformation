/* 统一尺寸与自适应框架：计算 stage 可用尺寸，广播 resize */
(function (g) {
  'use strict';
  var L = {};
  var listeners = [];
  var current = { w: 0, h: 0, dpr: 1, isNarrow: false, isShort: false };

  function measure() {
    var stage = document.getElementById('stage');
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    var w = Math.max(1, Math.floor(r.width));
    var h = Math.max(1, Math.floor(r.height));
    current = {
      w: w,
      h: h,
      dpr: window.devicePixelRatio || 1,
      isNarrow: w < 480,
      isShort: h < 520,
      vw: window.innerWidth,
      vh: window.innerHeight
    };
  }

  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](current); } catch (e) {}
    }
  }

  L.refresh = function () { measure(); notify(); return current; };
  L.get = function () { return current; };
  L.on = function (fn) { listeners.push(fn); };
  L.off = function (fn) {
    var i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1);
  };

  /* 让 canvas 按当前可用尺寸 + DPR 自适应，返回 CSS 尺寸 */
  L.fitCanvas = function (cv, ratio) {
    if (!cv) return { w: 0, h: 0 };
    measure();
    var w = current.w;
    var h = current.h;
    if (ratio) {
      var byH = h * ratio;
      if (byH < w) w = byH;
      else h = w / ratio;
    }
    var dpr = current.dpr;
    cv.width = Math.floor(w * dpr);
    cv.height = Math.floor(h * dpr);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    var ctx = cv.getContext('2d');
    if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: w, h: h };
  };

  /* 每个玩法可以拿这个工具做防抖动窗口尺寸变化 */
  L.observe = function (fn) {
    var raf = 0;
    function run() { raf = 0; measure(); fn(current); }
    function trig() { if (!raf) raf = requestAnimationFrame(run); }
    window.addEventListener('resize', trig, { passive: true });
    window.addEventListener('orientationchange', trig, { passive: true });
    if (window.ResizeObserver) {
      var stage = document.getElementById('stage');
      if (stage) new ResizeObserver(trig).observe(stage);
    }
    return trig;
  };

  window.addEventListener('resize', function () { measure(); notify(); }, { passive: true });
  window.addEventListener('orientationchange', function () { setTimeout(function () { measure(); notify(); }, 220); }, { passive: true });
  L.refresh();

  g.OMNI_LAYOUT = L;
})(window);
