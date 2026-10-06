/* 本地内联的轻量能力库：缓动 / 粒子 / 简易音效（不引任何 CDN） */
(function (g) {
  'use strict';
  var L = {};

  /* 缓动函数集合（Robert Penner 风格） */
  L.ease = {
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    inOutQuad: function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    outBack: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };

  /* 简易缓动 tween */
  L.tween = function (from, to, ms, onUpdate, onDone, easeFn) {
    var ease = easeFn || L.ease.outCubic;
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / ms);
      var v = from + (to - from) * ease(p);
      onUpdate && onUpdate(v, p);
      if (p < 1) requestAnimationFrame(step);
      else onDone && onDone();
    }
    requestAnimationFrame(step);
  };

  /* 轻量粒子系统 */
  L.Particles = function (canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var color = opts.color || 'rgba(94,231,255,';
    var count = opts.count || 60;
    var parts = [];
    function rand(a, b) { return a + Math.random() * (b - a); }
    for (var i = 0; i < count; i++) {
      parts.push({ x: rand(0, canvas.width), y: rand(0, canvas.height), vx: rand(-.4, .4), vy: rand(-.9, -.2), r: rand(1, 2.6), a: rand(.3, 1) });
    }
    var alive = true;
    function frame() {
      if (!alive) return;
      requestAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y < -6) { p.y = canvas.height + 6; p.x = rand(0, canvas.width); }
        ctx.fillStyle = color + p.a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    frame();
    return { stop: function () { alive = false; } };
  };

  /* 简易音效（WebAudio 合成，无外部文件） */
  var actx = null;
  function ac() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
    return actx;
  }
  L.sfx = {
    ok: function () { beep(880, .08, 'sine', .18); },
    bad: function () { beep(220, .16, 'sawtooth', .16); },
    up: function () { beep(660, .09, 'triangle', .18); setTimeout(function () { beep(990, .12, 'triangle', .18); }, 90); }
  };
  function beep(freq, dur, type, vol) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), gn = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    gn.gain.value = vol || .15;
    gn.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(gn); gn.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }

  g.OMNI_LIB = L;
})(window);
