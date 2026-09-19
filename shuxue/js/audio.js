/* 语音 + 音效：TTS 温柔女声 + WebAudio 现场合成童趣音效 */
(function () {
  var state = { voiceOn: true, sfxOn: true, volume: 0.8, voice: null, ctx: null };
  var synth = window.speechSynthesis;

  /* 严格挑选中文女声：按优先级匹配，确保发音是中文 */
  function pickVoice() {
    if (!synth) return null;
    var list = synth.getVoices() || [];
    if (!list.length) return null;

    /* 只看中文语音（zh / cmn / Chinese） */
    var zh = list.filter(function (v) {
      return /^(zh|cmn)/i.test(v.lang || '') || /chinese|中文|普通话/i.test(v.name || '');
    });
    if (!zh.length) {
      /* 退而求其次：lang 里含 zh 的任意项 */
      zh = list.filter(function (v) { return /zh/i.test(v.lang || ''); });
    }
    if (!zh.length) return null;

    /* 女声优先名单（按好听程度排序） */
    var femaleNames = [
      'Xiaoxiao', 'Xiaoyi', 'Xiaochen', 'Xiaohan', 'Xiaomeng', 'Xiaomo', 'Xiaorui',
      'Huihui', 'Yaoyao', 'Kangkang', 'Tingting', 'Meijia', 'Mei-Jia', 'Sinji',
      'Google 普通话', 'Google 國語', 'Google Chinese', 'Liang', 'Hanhan'
    ];
    var maleNames = ['Yunxi', 'Yunyang', 'Yunjian', 'Yunxia', 'Kangkang', 'Yunye'];

    /* 1) 优先精确匹配女声 */
    for (var i = 0; i < femaleNames.length; i++) {
      for (var j = 0; j < zh.length; j++) {
        if ((zh[j].name || '').indexOf(femaleNames[i]) >= 0) return zh[j];
      }
    }
    /* 2) 排除男声后取中文语音 */
    var notMale = zh.filter(function (v) {
      return !maleNames.some(function (mn) { return (v.name || '').indexOf(mn) >= 0; });
    });
    if (notMale.length) return notMale[0];
    /* 3) 兜底 */
    return zh[0];
  }
  if (synth) {
    state.voice = pickVoice();
    synth.onvoiceschanged = function () { state.voice = pickVoice(); };
    /* 部分浏览器语音列表延迟加载，轮询几次 */
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (!state.voice) state.voice = pickVoice();
      if (state.voice || tries > 20) clearInterval(timer);
    }, 250);
  }

  function speak(text, opts) {
    if (!state.voiceOn || !synth || !text) return;
    opts = opts || {};
    if (!state.voice) state.voice = pickVoice();
    try { synth.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'zh-CN';
    u.rate = opts.rate || 0.78;      /* 放慢，儿童听得清 */
    u.pitch = opts.pitch || 1.15;    /* 略高，温柔女声 */
    u.volume = state.volume;
    if (state.voice) u.voice = state.voice;
    u.onend = opts.onend || null;
    synth.speak(u);
  }

  function ctx() {
    if (!state.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      state.ctx = new AC();
    }
    if (state.ctx.state === 'suspended') state.ctx.resume();
    return state.ctx;
  }

  function tone(freq, start, dur, type, gainVal) {
    var c = ctx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, c.currentTime + start);
    g.gain.setValueAtTime(0, c.currentTime + start);
    g.gain.linearRampToValueAtTime(gainVal * state.volume, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.02);
  }

  function glide(f1, f2, start, dur, type, gainVal) {
    var c = ctx(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f1, c.currentTime + start);
    o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + start + dur);
    g.gain.setValueAtTime(0, c.currentTime + start);
    g.gain.linearRampToValueAtTime(gainVal * state.volume, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.02);
  }

  var SFX = {
    click:  function () { tone(880, 0, 0.09, 'sine', 0.18); tone(1320, 0.04, 0.08, 'sine', 0.10); },
    pop:    function () { glide(420, 900, 0, 0.14, 'sine', 0.20); },
    slide:  function () { glide(300, 620, 0, 0.22, 'triangle', 0.13); },
    right:  function () { [660, 880, 1180].forEach(function (f, i) { tone(f, i * 0.09, 0.20, 'sine', 0.20); }); },
    wrong:  function () { glide(400, 190, 0, 0.34, 'sine', 0.16); },
    win:    function () { [523, 659, 784, 1046, 1318].forEach(function (f, i) { tone(f, i * 0.11, 0.34, 'sine', 0.20); }); },
    star:   function () { tone(1568, 0, 0.13, 'sine', 0.14); tone(2093, 0.06, 0.16, 'sine', 0.10); }
  };

  function sfx(name) {
    if (!state.sfxOn) return;
    var fn = SFX[name]; if (fn) { try { fn(); } catch (e) {} }
  }

  window.Audio2 = {
    speak: speak,
    sfx: sfx,
    unlock: function () { ctx(); if (synth) { try { synth.resume(); } catch (e) {} } },
    setVoiceOn: function (v) { state.voiceOn = !!v; if (!v && synth) { try { synth.cancel(); } catch (e) {} } },
    setSfxOn: function (v) { state.sfxOn = !!v; },
    setVolume: function (v) { state.volume = Math.max(0, Math.min(1, v)); },
    isVoiceOn: function () { return state.voiceOn; },
    isSfxOn: function () { return state.sfxOn; }
  };
})();
