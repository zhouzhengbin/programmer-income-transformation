/* 动画引擎：Canvas 绘制 + 缓动 + 时间轴步骤调度 */
(function () {
  var ease = {
    linear:  function (t) { return t; },
    outQuad:  function (t) { return 1 - (1 - t) * (1 - t); },
    inOutQuad:function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    outCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    outBack:  function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    outElastic: function (t) {
      if (t === 0 || t === 1) return t;
      var p = 0.42;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }
  };

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function stick(ctx, x, y, w, h, color, round) {
    var r = round === false ? 3 : Math.min(w, h) / 2.4;
    roundRect(ctx, x - w / 2, y - h, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.save();
    ctx.globalAlpha = 0.28;
    roundRect(ctx, x - w / 2 + w * 0.18, y - h + h * 0.10, w * 0.24, h * 0.78, r * 0.6);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }

  function dot(ctx, x, y, r, color) {
    var g = ctx.createRadialGradient(x - r * 0.34, y - r * 0.34, r * 0.12, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.42, color);
    g.addColorStop(1, color);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function apple(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x - r * 0.34, y, r * 0.74, 0, Math.PI * 2);
    ctx.arc(x + r * 0.34, y, r * 0.74, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8FA3';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.92, r * 0.30, r * 0.16, -0.42, 0, Math.PI * 2);
    ctx.fillStyle = '#8FD98F';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.86);
    ctx.lineTo(x + r * 0.10, y - r * 1.28);
    ctx.strokeStyle = '#B98A5A';
    ctx.lineWidth = Math.max(2, r * 0.14);
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function kitty(ctx, x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-22, -12); ctx.lineTo(-24, -40); ctx.lineTo(-2, -24); ctx.closePath();
    ctx.moveTo(22, -12); ctx.lineTo(24, -40); ctx.lineTo(2, -24); ctx.closePath();
    ctx.fillStyle = '#FFD166';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE7A8';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-10, -3, 3.6, 0, Math.PI * 2);
    ctx.arc(10, -3, 3.6, 0, Math.PI * 2);
    ctx.fillStyle = '#5A4634';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 7, 4.4, 0, Math.PI * 2);
    ctx.fillStyle = '#FF9DBB';
    ctx.fill();
    ctx.restore();
  }

  /* 小鸟 */
  function bird(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    var flap = Math.sin((t || 0) * 8) * 0.5;
    ctx.fillStyle = '#7EC8F5';
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(12, -7, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-6, -2); ctx.lineTo(-16, -14 + flap * 8); ctx.lineTo(2, -6);
    ctx.fillStyle = '#5FAFE0'; ctx.fill();
    ctx.beginPath(); ctx.arc(15, -9, 2.4, 0, Math.PI * 2); ctx.fillStyle = '#3D2E22'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, -7); ctx.lineTo(28, -5); ctx.lineTo(20, -3);
    ctx.fillStyle = '#FFA74D'; ctx.fill();
    ctx.restore();
  }

  /* 蝴蝶 */
  function butterfly(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    var w = Math.abs(Math.sin((t || 0) * 6)) * 0.7 + 0.3;
    ctx.fillStyle = '#FF9BB8';
    ctx.beginPath(); ctx.ellipse(-11, -5, 12 * w, 15, -0.35, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(11, -5, 12 * w, 15, 0.35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFD93D';
    ctx.beginPath(); ctx.ellipse(-9, 8, 8 * w, 10, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9, 8, 8 * w, 10, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7A5A3A';
    ctx.beginPath(); ctx.ellipse(0, 0, 3, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7A5A3A'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-2, -13); ctx.lineTo(-6, -20); ctx.moveTo(2, -13); ctx.lineTo(6, -20); ctx.stroke();
    ctx.restore();
  }

  /* 树 */
  function tree(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#B98A5A';
    E_roundRect(ctx, -7, -34, 14, 36, 5); ctx.fill();
    var g = ctx.createRadialGradient(-12, -52, 6, 0, -46, 40);
    g.addColorStop(0, '#B8EDA8'); g.addColorStop(1, '#5CC44A');
    ctx.beginPath(); ctx.arc(0, -50, 32, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(-20, -40, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(20, -42, 22, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function E_roundRect(ctx, x, y, w, h, r) { roundRect(ctx, x, y, w, h, r); }

  /* 房子 */
  function house(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#FFF0C8';
    roundRect(ctx, -26, -34, 52, 36, 6); ctx.fill();
    ctx.fillStyle = '#FF8FB1';
    ctx.beginPath(); ctx.moveTo(-32, -34); ctx.lineTo(0, -60); ctx.lineTo(32, -34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8FD4F7';
    roundRect(ctx, -9, -22, 18, 18, 3); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, -4); ctx.moveTo(-9, -13); ctx.lineTo(9, -13); ctx.stroke();
    ctx.restore();
  }

  /* 胡萝卜 */
  function carrot(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-9, -12); ctx.lineTo(9, -12); ctx.lineTo(0, 20); ctx.closePath();
    ctx.fillStyle = '#FFA74D'; ctx.fill();
    ctx.strokeStyle = '#E8892E'; ctx.lineWidth = 1.5;
    for (var i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(-6 + i * 5, -6); ctx.lineTo(-3 + i * 5, -1); ctx.stroke();
    }
    ctx.fillStyle = '#5CC44A';
    ctx.beginPath(); ctx.ellipse(-6, -16, 6, 10, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(6, -16, 6, 10, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -20, 5, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* 气球 */
  function balloon(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 19, 0, 0, Math.PI * 2);
    ctx.fillStyle = color || '#FF6E96'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-5, -6, 4, 6, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 19); ctx.lineTo(-4, 25); ctx.lineTo(4, 25); ctx.closePath();
    ctx.fillStyle = color || '#FF6E96'; ctx.fill();
    ctx.strokeStyle = 'rgba(150,150,150,.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 25);
    ctx.quadraticCurveTo(8, 38, 0, 50); ctx.stroke();
    ctx.restore();
  }

  /* 草丛 */
  function bush(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#7ED96A';
    ctx.beginPath(); ctx.arc(-14, 0, 15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -6, 19, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(15, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function Timeline() {
    this.steps = [];
    this.cursor = -1;
    this.playing = false;
    this.t = 0;
    this.speed = 1;
  }
  Timeline.prototype.push = function (dur, draw, opts) {
    opts = opts || {};
    this.steps.push({
      dur: dur,
      draw: draw,
      ease: opts.ease || 'outCubic',
      onStart: opts.onStart || null,
      onEnd: opts.onEnd || null,
      say: opts.say || null,
      label: opts.label || null
    });
    return this;
  };

  /* 当前步骤说明文字 */
  Timeline.prototype.currentLabel = function () {
    if (this.cursor < 0 || this.cursor >= this.steps.length) return '';
    var st = this.steps[this.cursor];
    return st ? (st.label || '') : '';
  };
  Timeline.prototype.reset = function () {
    this.cursor = -1;
    this.t = 0;
    this.playing = false;
  };
  Timeline.prototype.total = function () { return this.steps.length; };
  Timeline.prototype.goto = function (i, instant) {
    i = clamp(i, 0, this.steps.length - 1);
    for (var k = 0; k < i; k++) {
      var s = this.steps[k];
      if (s) s.draw(1, 1, true);
    }
    this.cursor = i;
    this.t = instant ? (this.steps[i] ? this.steps[i].dur : 0) : 0;
    return this;
  };
  Timeline.prototype.next = function () {
    if (this.cursor + 1 >= this.steps.length) return false;
    this.cursor++;
    this.t = 0;
    var s = this.steps[this.cursor];
    if (s.onStart) s.onStart();
    if (s.say && window.Audio2) window.Audio2.speak(s.say);
    return true;
  };
  Timeline.prototype.update = function (dt) {
    if (!this.playing) return false;
    if (this.cursor < 0) { if (!this.next()) { this.playing = false; return false; } }
    var s = this.steps[this.cursor];
    if (!s) { this.playing = false; return false; }
    this.t += dt * this.speed;
    var raw = s.dur <= 0 ? 1 : clamp(this.t / s.dur, 0, 1);
    var e = ease[s.ease] ? ease[s.ease](raw) : raw;
    s.draw(e, raw, false);
    if (raw >= 1) {
      if (s.onEnd) s.onEnd();
      if (this.cursor + 1 >= this.steps.length) { this.playing = false; return false; }
      this.cursor++;
      this.t = 0;
      var n = this.steps[this.cursor];
      if (n.onStart) n.onStart();
      if (n.say && window.Audio2) window.Audio2.speak(n.say);
    }
    return true;
  };

  function Stage(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0; this.H = 0; this.dpr = 1;
    this.bg = null;
    this.scene = null;
    this.time = 0;
    this.resize();
    var self = this;
    this._onResize = function () { self.resize(); };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('orientationchange', this._onResize);
  }
  Stage.prototype.resize = function () {
    var r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.W = Math.max(1, Math.round(r.width));
    this.H = Math.max(1, Math.round(r.height));
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };
  Stage.prototype.start = function () {
    var self = this, last = 0;
    function loop(ts) {
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      self.time += dt;
      self.ctx.clearRect(0, 0, self.W, self.H);
      if (self.bg) self.bg(self.ctx, self.W, self.H, self.time);
      if (self.scene) self.scene(self.ctx, self.W, self.H, self.time, dt);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  };

  window.Engine = {
    ease: ease, clamp: clamp, lerp: lerp,
    roundRect: roundRect, stick: stick, dot: dot, apple: apple, kitty: kitty,
    bird: bird, butterfly: butterfly, tree: tree, house: house,
    carrot: carrot, balloon: balloon, bush: bush,
    Timeline: Timeline, Stage: Stage
  };
})();
