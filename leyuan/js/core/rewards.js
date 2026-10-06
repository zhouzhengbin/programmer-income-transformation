/* 奖励与反馈系统：星星、连击、音效、粒子爆裂、角色表情 */
(function (g) {
  'use strict';
  var R = {};
  var state = { stars: 0, streak: 0, best: 0 };

  var fx = null, fxc = null, parts = [];
  function initFx() {
    fx = document.getElementById('fx');
    if (!fx) return;
    fxc = fx.getContext('2d');
    function size() { fx.width = innerWidth; fx.height = innerHeight; }
    size();
    addEventListener('resize', size);
    (function loop() {
      requestAnimationFrame(loop);
      fxc.clearRect(0, 0, fx.width, fx.height);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.a -= 0.016; p.life--;
        if (p.life <= 0 || p.a <= 0) { parts.splice(i, 1); continue; }
        fxc.globalAlpha = Math.max(0, p.a);
        fxc.fillStyle = p.c;
        fxc.beginPath(); fxc.arc(p.x, p.y, p.r, 0, Math.PI * 2); fxc.fill();
      }
      fxc.globalAlpha = 1;
    })();
  }

  function burst(x, y, color, n) {
    if (!fxc) return;
    n = n || 28;
    for (var i = 0; i < n; i++) {
      var ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 6;
      parts.push({
        x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
        g: 0.16, r: 2 + Math.random() * 3.4, a: 1, life: 40 + Math.random() * 30,
        c: color || (i % 2 ? '#5ee7ff' : '#ffd166')
      });
    }
  }

  /* WebAudio 合成音效，无外部文件 */
  var actx = null;
  function ac() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
    }
    if (actx && actx.state === 'suspended') { actx.resume(); }
    return actx;
  }
  function beep(freq, dur, type, vol) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), gn = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    gn.gain.value = vol || .14;
    gn.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(gn); gn.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur);
  }
  var sfx = {
    pick:  function () { beep(660, .07, 'triangle', .12); },
    ok:    function () { beep(880, .09, 'sine', .16); setTimeout(function () { beep(1180, .11, 'sine', .14); }, 70); },
    bad:   function () { beep(200, .18, 'sawtooth', .13); },
    level: function () { [660, 880, 1180].forEach(function (f, i) { setTimeout(function () { beep(f, .14, 'triangle', .16); }, i * 90); }); },
    spin:  function () { beep(420, .05, 'square', .07); }
  };

  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 1500);
  }

  function refresh() {
    var el = document.getElementById('starNum');
    if (el) el.textContent = state.stars;
  }

  function gain(n, x, y, label) {
    state.stars += n;
    state.streak++;
    if (state.streak > state.best) state.best = state.streak;
    refresh();
    sfx.ok();
    if (x != null) burst(x, y, null, 24 + Math.min(30, n * 3));
    toast((label ? label + ' ' : '') + '+' + n + '★' + (state.streak > 2 ? ' 连击 x' + state.streak : ''));
    if (state.streak > 0 && state.streak % 5 === 0) sfx.level();
  }

  function miss() {
    state.streak = 0;
    sfx.bad();
  }

  function reset() { state.streak = 0; }

  R.init = initFx;
  R.gain = gain;
  R.miss = miss;
  R.reset = reset;
  R.burst = burst;
  R.toast = toast;
  R.sfx = sfx;
  R.state = state;
  g.OMNI_REWARD = R;
})(window);
