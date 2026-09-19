/* 主控：知识地图 / 课程调度 / 答题 / 奖励特效 */
(function () {
  /* DOM 就绪守卫：即使脚本被提前加载也能安全启动 */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
    return;
  }
  boot();

  function boot() {
  var A = window.Audio2, E = window.Engine;

  /* ---------- 课程清单 ---------- */
  var CATALOG = [
    { id: 'add',      unit: '第一单元', icon: '➕', dyn: 'add', name: '100以内加法',
      py: 'yī bǎi yǐ nèi jiā fǎ',
      color: 'linear-gradient(180deg,#FFE7A8,#FFC93C)', build: 'addNoCarry',
      quiz: { q: '34 + 23 = ?', opts: [57, 56, 67, 47], ans: 57 } },
    { id: 'carry',    unit: '第二单元', icon: '🧮', name: '进位加法', dyn: 'carry',
      py: 'jìn wèi jiā fǎ',
      color: 'linear-gradient(180deg,#FFD9A0,#FFA74D)', build: 'carry',
      quiz: { q: '28 + 5 = ?', opts: [33, 23, 34, 32], ans: 33 } },
    { id: 'borrow',   unit: '第二单元', icon: '✂️', name: '退位减法', dyn: 'borrow',
      py: 'tuì wèi jiǎn fǎ',
      color: 'linear-gradient(180deg,#FFC6D9,#FF6E96)', build: 'borrow',
      quiz: { q: '32 − 7 = ?', opts: [25, 24, 26, 35], ans: 25 } },
    { id: 'angle',    unit: '第三单元', icon: '📐', dyn: 'angle', name: '角的初步认识',
      py: 'jiǎo de chū bù rèn shi',
      color: 'linear-gradient(180deg,#E0C6FF,#C79BF5)', build: 'angle',
      quiz: { q: '一个角有几个顶点？', opts: [1, 2, 3, 4], ans: 1 } },
    { id: 'multiply', unit: '第四单元', icon: '🔢', name: '表内乘法', dyn: 'multiply',
      py: 'biǎo nèi chéng fǎ',
      color: 'linear-gradient(180deg,#9BD7FF,#4AA8E0)', build: 'multiply',
      quiz: { q: '3 × 4 = ?', opts: [12, 7, 9, 16], ans: 12 } },
    { id: 'observe',  unit: '第五单元', icon: '👀', dyn: 'observe', name: '观察物体',
      py: 'guān chá wù tǐ',
      color: 'linear-gradient(180deg,#B5E8A8,#5CC44A)', build: 'observe',
      quiz: { q: '同一物体换个角度，看到的形状？', opts: ['可能不同', '一定相同', '变没了', '变大'], ans: '可能不同' } },
    { id: 'length',   unit: '第六单元', icon: '📏', dyn: 'length', name: '长度单位',
      py: 'cháng dù dān wèi',
      color: 'linear-gradient(180deg,#A8E0FF,#5FAFE0)', build: 'length',
      quiz: { q: '1 米 = ? 厘米', opts: [100, 10, 1000, 60], ans: 100 } },
    { id: 'clock',    unit: '第七单元', icon: '🕐', dyn: 'clock', name: '认识时间',
      py: 'rèn shi shí jiān',
      color: 'linear-gradient(180deg,#FFE08A,#FFB800)', build: 'clock',
      quiz: { q: '1 时 = ? 分', opts: [60, 30, 100, 12], ans: 60 } },
    { id: 'match',    unit: '第八单元', icon: '👕', dyn: 'match', name: '数学广角·搭配',
      py: 'shù xué guǎng jiǎo · dā pèi',
      color: 'linear-gradient(180deg,#FFC6D9,#FF9BB8)', build: 'match',
      quiz: { q: '2件上衣配3条裤子，有几种搭配？', opts: [6, 5, 3, 9], ans: 6 } },

    /* ================= 下册 ================= */
    { id: 'divide',   unit: '下册 第二单元', icon: '🍎', dyn: 'divide', name: '除法的初步认识',
      py: 'chú fǎ de chū bù rèn shi',
      color: 'linear-gradient(180deg,#FFE7A8,#FFC93C)', build: 'divide',
      quiz: { q: '12 ÷ 3 = ?', opts: [4, 3, 6, 5], ans: 4 } },
    { id: 'remainder',unit: '下册 第六单元', icon: '📦', dyn: 'remainder', name: '有余数的除法',
      py: 'yǒu yú shù de chú fǎ',
      color: 'linear-gradient(180deg,#FFC6D9,#FF6E96)', build: 'remainder',
      quiz: { q: '17 ÷ 5 = 3 余 ?', opts: [2, 3, 1, 4], ans: 2 } },
    { id: 'bigNumber',unit: '下册 第七单元', icon: '🔢', dyn: 'bigNumber', name: '万以内数的认识',
      py: 'wàn yǐ nèi shù de rèn shi',
      color: 'linear-gradient(180deg,#A8E0FF,#4A9BE0)', build: 'bigNumber',
      quiz: { q: '2356 的千位是几？', opts: [2, 3, 5, 6], ans: 2 } },
    { id: 'weight',   unit: '下册 第八单元', icon: '⚖️', dyn: 'weight', name: '克与千克',
      py: 'kè yǔ qiān kè',
      color: 'linear-gradient(180deg,#B5E8A8,#5CC44A)', build: 'weight',
      quiz: { q: '1 千克 = ? 克', opts: [1000, 100, 10, 500], ans: 1000 } },
    { id: 'symmetry', unit: '下册 第三单元', icon: '🦋', dyn: 'symmetry', name: '轴对称图形',
      py: 'zhóu duì chèn tú xíng',
      color: 'linear-gradient(180deg,#FFC6D9,#F0578A)', build: 'symmetry',
      quiz: { q: '蝴蝶左右两边一样，是什么图形？', opts: ['轴对称', '平移', '旋转', '圆'], ans: '轴对称' } },
    { id: 'translate',unit: '下册 第三单元', icon: '➡️', dyn: 'translate', name: '平移',
      py: 'píng yí',
      color: 'linear-gradient(180deg,#A8E0FF,#4A9BE0)', build: 'translate',
      quiz: { q: '推拉窗是什么运动？', opts: ['平移', '旋转', '轴对称', '翻转'], ans: '平移' } },
    { id: 'rotate',   unit: '下册 第三单元', icon: '🌀', dyn: 'rotate', name: '旋转',
      py: 'xuán zhuǎn',
      color: 'linear-gradient(180deg,#E0C6FF,#9B6FE0)', build: 'rotate',
      quiz: { q: '风车转动是什么运动？', opts: ['旋转', '平移', '轴对称', '滚动'], ans: '旋转' } },
    { id: 'chart',    unit: '下册 第一单元', icon: '📊', dyn: 'chart', name: '数据收集整理',
      py: 'shù jù shōu jí zhěng lǐ',
      color: 'linear-gradient(180deg,#FFD9A0,#FFA74D)', build: 'chart',
      quiz: { q: '条形统计图中，柱子越高表示？', opts: ['数量越多', '数量越少', '颜色越深', '越大越圆'], ans: '数量越多' } }
  ];

  /* ---------- 进度存档 ---------- */
  var SAVE_KEY = 'xiaoer_suanshu_v1';
  function loadSave() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { stars: {}, voice: true, sfx: true, vol: 0.8 }; }
    catch (e) { return { stars: {}, voice: true, sfx: true, vol: 0.8 }; }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }
  var save = loadSave();

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var homeScreen = $('home'), lessonScreen = $('lesson');
  var mapGrid = $('mapGrid'), stage = $('stage'), hintEl = $('stageHint');
  var titleEl = $('lessonTitle'), titlePy = $('lessonPy');
  var dotsEl = $('progressDots');
  var quizLayer = $('quizLayer'), quizQ = $('quizQ'), quizOpts = $('quizOpts'), quizFb = $('quizFb');
  var rewardLayer = $('rewardLayer'), fxCanvas = $('fxCanvas'), rewardCard = $('rewardCard');
  var stepBadge = $('stepBadge'), progressLabel = $('progressLabel'), groundFlowers = $('groundFlowers');

  /* 关键节点缺失时安全退出，避免白屏 */
  if (!stage || !mapGrid) {
    if (window.console) console.warn('[小二算数] 关键节点未找到，启动中止');
    return;
  }

  /* ---------- 舞台 ---------- */
  var st = new E.Stage(stage);
  st.start();
  var current = null;       /* 当前课程对象 */
  var timeline = null;      /* 当前时间轴 */

  /* ---------- 换题钩子：供 lessons.js 的 reroll 调用 ---------- */
  window.__swapLesson = function (fresh) {
    if (!fresh || !fresh.tl) return;
    current = fresh;
    timeline = fresh.tl;
    timeline.reset();
    lastLabel = '';
    var stEl2 = document.getElementById('stepText');
    if (stEl2) stEl2.textContent = '';
    st.scene = function (ctx, W, H, t, dt) {
      current.draw(ctx, W, H, t, dt);
      timeline.update(dt);
    };
    /* 重建进度点 */
    dotsEl.innerHTML = '';
    for (var i = 0; i < fresh.steps; i++) {
      var d2 = document.createElement('div');
      d2.className = 'pdot';
      dotsEl.appendChild(d2);
    }
    updateDots();
    var pb = $('btnPlay');
    if (pb) pb.querySelector('.ico').textContent = '▶';
  };

  /* ---------- 首页卡片 ---------- */
  function buildHome() {
    mapGrid.innerHTML = '';
    CATALOG.forEach(function (item, idx) {
      var card = document.createElement('div');
      card.className = 'lesson-card';
      card.style.animationDelay = (idx * 0.08) + 's';
      var stars = save.stars[item.id] || 0;
      card.innerHTML =
        '<div class="card-unit">' + (item.unit || '') + '</div>' +
        '<div class="card-num">' + (idx + 1) + '</div>' +
        '<div class="card-stars">' + (stars > 0 ? '⭐'.repeat(Math.min(stars, 3)) : '') + '</div>' +
        '<div class="lc-icon" style="background:' + item.color + '">' + item.icon + '</div>' +
        '<div class="lc-name">' + item.name + '</div>' +
        '<div class="lc-py">' + item.py + '</div>';
      card.addEventListener('click', function () {
        A.unlock();
        A.sfx('click');
        openLesson(item);
      });
      mapGrid.appendChild(card);
    });
  }

  /* ---------- 打开课程 ---------- */
  function openLesson(item) {
    titleEl.textContent = item.name;
    titleEl.setAttribute('data-py', item.py);
    titlePy.textContent = item.py;
    /* 清理旧拼音标签 */
    var old = titleEl.querySelector('.py-tag');
    if (old) old.remove();

    current = window.Lessons[item.build]();
    timeline = current.tl;
    timeline.reset();
    lastLabel = '';
    var stEl = document.getElementById('stepText');
    if (stEl) stEl.textContent = '';

    st.scene = function (ctx, W, H, t, dt) {
      current.draw(ctx, W, H, t, dt);
      timeline.update(dt);
      syncStepText();
    };

    /* 进度点 */
    dotsEl.innerHTML = '';
    for (var i = 0; i < current.steps; i++) {
      var d = document.createElement('div');
      d.className = 'pdot';
      dotsEl.appendChild(d);
    }
    updateDots();

    homeScreen.classList.remove('active');
    lessonScreen.classList.add('active');
    setTimeout(function () { st.resize(); }, 60);

    showHint(current.name);
    if (stepBadge) { stepBadge.classList.add('show'); }
    updateProgressLabel();
    A.speak(item.name + '，我们一起来看');
  }

  var lastLabel = '';
  function syncStepText() {
    var el = document.getElementById('stepText');
    if (!el || !timeline) return;
    var lb = timeline.currentLabel ? timeline.currentLabel() : '';
    if (lb && lb !== lastLabel) {
      lastLabel = lb;
      el.textContent = lb;
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
  }

  function updateDots() {
    var ds = dotsEl.querySelectorAll('.pdot');
    for (var i = 0; i < ds.length; i++) {
      ds[i].classList.toggle('on', i <= timeline.cursor);
    }
    updateProgressLabel();
  }

  function updateProgressLabel() {
    if (!progressLabel || !timeline) return;
    var cur = timeline.cursor < 0 ? 0 : timeline.cursor + 1;
    var all = timeline.steps.length;
    progressLabel.textContent = '第 ' + cur + ' / ' + all + ' 步';
    if (stepBadge) {
      stepBadge.textContent = cur > 0 ? ('第 ' + cur + ' 步') : '准备开始';
      stepBadge.classList.add('show');
    }
  }

  function showHint(text) {
    hintEl.textContent = text;
    hintEl.classList.add('show');
    clearTimeout(hintEl._t);
    hintEl._t = setTimeout(function () { hintEl.classList.remove('show'); }, 2200);
  }

  /* ---------- 控制按钮 ---------- */
  $('btnBack').addEventListener('click', function () {
    A.sfx('click');
    try { speechSynthesis.cancel(); } catch (e) {}
    st.scene = null;
    lessonScreen.classList.remove('active');
    homeScreen.classList.add('active');
    buildGroundFlowers();
  buildHome();
  });

  $('btnPlay').addEventListener('click', function () {
    A.unlock(); A.sfx('click');
    if (timeline.cursor >= timeline.steps.length - 1 && timeline.t < 0.01) {
      timeline.reset();
      updateDots();
    }
    timeline.playing = !timeline.playing;
    this.querySelector('.ico').textContent = timeline.playing ? '⏸' : '▶';
    if (timeline.playing) {
      var self2 = this;
      var iv = setInterval(function () {
        updateProgressLabel();
        if (!timeline.playing) { clearInterval(iv); updateProgressLabel(); }
      }, 200);
    }
    var self = this;
    if (timeline.playing && timeline.cursor < 0) timeline.next();
    setTimeout(function () {
      if (!timeline.playing) self.querySelector('.ico').textContent = '▶';
    }, 100);
  });

  $('btnStep').addEventListener('click', function () {
    A.unlock(); A.sfx('slide');
    timeline.playing = false;
    $('btnPlay').querySelector('.ico').textContent = '▶';
    if (timeline.cursor + 1 >= timeline.steps.length) {
      showHint('已经看完啦');
      return;
    }
    timeline.next();
    /* 立即结算到该步末尾 */
    timeline.t = timeline.steps[timeline.cursor].dur;
    timeline.steps[timeline.cursor].draw(1, 1, false);
    updateDots();
  });

  $('btnNew').addEventListener('click', function () {
    A.unlock(); A.sfx('pop');
    if (current && typeof current.reroll === 'function') {
      current.reroll();
      timeline.reset();
      updateDots();
      showHint('换了一道新题');
      A.speak('换一道新题，我们再来一次');
      $('btnPlay').querySelector('.ico').textContent = '▶';
    } else {
      showHint('这一课只有一个例子');
    }
  });

  $('btnReplay').addEventListener('click', function () {
    A.sfx('click');
    timeline.reset();
    updateDots();
    $('btnPlay').querySelector('.ico').textContent = '▶';
    try { speechSynthesis.cancel(); } catch (e) {}
    showHint('再看一遍');
  });

  /* ---------- 答题 ---------- */
  var quizItem = null;
  var CHALLENGE_TOTAL = 5;
  var challenge = { on: false, idx: 0, right: 0, wrong: 0, current: null };

  function updateChallengeBar() {
    var bar = document.getElementById('challengeBar');
    if (!bar) return;
    if (!challenge.on) { bar.classList.remove('show'); return; }
    bar.classList.add('show');
    bar.textContent = '闯关 ' + (challenge.idx + 1) + ' / ' + CHALLENGE_TOTAL +
                      '　答对 ' + challenge.right + '　答错 ' + challenge.wrong;
  }
  $('btnQuiz').addEventListener('click', function () {
    A.unlock(); A.sfx('click');
    challenge.on = false;
    updateChallengeBar();
    openQuiz();
  });

  $('btnChallenge').addEventListener('click', function () {
    A.unlock(); A.sfx('win');
    challenge = { on: true, idx: 0, right: 0, wrong: 0, current: null };
    updateChallengeBar();
    showHint('闯关开始，连答 5 题');
    A.speak('闯关开始，连续答对五道题');
    openQuiz();
  });

  /* 根据课程类型动态生成一道题 */
  function makeDynamicQuiz(item) {
    if (!item.dyn) return null;
    if (item.dyn === 'carry') {
      var a, b;
      do { a = 11 + Math.floor(Math.random() * 78); b = 2 + Math.floor(Math.random() * 8); }
      while ((a % 10) + b < 10 || a + b > 100);
      var ans = a + b;
      return { q: a + ' + ' + b + ' = ?', ans: ans, opts: mkOpts(ans, 1) };
    }
    if (item.dyn === 'borrow') {
      var a2, b2;
      do { a2 = 21 + Math.floor(Math.random() * 70); b2 = 2 + Math.floor(Math.random() * 8); }
      while ((a2 % 10) >= b2 || a2 - b2 < 10);
      var ans2 = a2 - b2;
      return { q: a2 + ' − ' + b2 + ' = ?', ans: ans2, opts: mkOpts(ans2, 1) };
    }
    if (item.dyn === 'multiply') {
      var r = 2 + Math.floor(Math.random() * 7);
      var c = 2 + Math.floor(Math.random() * 8);
      var ans3 = r * c;
      return { q: r + ' × ' + c + ' = ?', ans: ans3, opts: mkOpts(ans3, 1) };
    }
    if (item.dyn === 'add') {
      var a4, b4;
      do { a4 = 12 + Math.floor(Math.random() * 70); b4 = 11 + Math.floor(Math.random() * 70); }
      while ((a4 % 10) + (b4 % 10) >= 10 || a4 + b4 > 99);
      var ans4 = a4 + b4;
      return { q: a4 + ' + ' + b4 + ' = ?', ans: ans4, opts: mkOpts(ans4, 1) };
    }
    if (item.dyn === 'angle') {
      var pool = [
        { q: '一个角有几个顶点？', ans: 1, opts: [1, 2, 3, 4] },
        { q: '一个角有几条边？', ans: 2, opts: [1, 2, 3, 4] },
        { q: '直角是多少度？', ans: 90, opts: [90, 45, 180, 60] },
        { q: '角的大小与什么有关？', ans: '开口大小', opts: ['开口大小', '边的长短', '颜色', '位置'] },
        { q: '比直角小的角叫什么？', ans: '锐角', opts: ['锐角', '钝角', '直角', '平角'] },
        { q: '比直角大的角叫什么？', ans: '钝角', opts: ['钝角', '锐角', '直角', '平角'] },
        { q: '角的两条边是？', ans: '射线', opts: ['射线', '线段', '直线', '曲线'] },
        { q: '一个角至少有几点？', ans: 1, opts: [1, 2, 3, 0] }
      ];
      return pool[Math.floor(Math.random() * pool.length)];
    }
    if (item.dyn === 'length') {
      var pool2 = [
        { q: '1 米 = ? 厘米', ans: 100, opts: [100, 10, 1000, 60] },
        { q: '量铅笔用什么单位？', ans: '厘米', opts: ['厘米', '米', '千米', '千克'] },
        { q: '量教室长用什么单位？', ans: '米', opts: ['米', '厘米', '毫米', '克'] },
        { q: '10 厘米 = ? 分米', ans: 1, opts: [1, 10, 100, 5] },
        { q: '量书本厚度用什么单位？', ans: '厘米', opts: ['厘米', '米', '千米', '吨'] },
        { q: '1 米 = ? 分米', ans: 10, opts: [10, 100, 1000, 1] },
        { q: '量操场跑道用什么单位？', ans: '米', opts: ['米', '厘米', '毫米', '克'] },
        { q: '课桌高约 70 什么？', ans: '厘米', opts: ['厘米', '米', '千米', '分米'] }
      ];
      return pool2[Math.floor(Math.random() * pool2.length)];
    }
    if (item.dyn === 'clock') {
      var h = 1 + Math.floor(Math.random() * 11);
      var m = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      var pool3 = [
        { q: '1 时 = ? 分', ans: 60, opts: [60, 30, 100, 12] },
        { q: '分针走一圈，时针走几大格？', ans: 1, opts: [1, 2, 12, 60] },
        { q: '半小时 = ? 分', ans: 30, opts: [30, 60, 15, 50] },
        { q: '分针走一圈是多少分？', ans: 60, opts: [60, 30, 12, 100] },
        { q: '钟面上一共有几个大格？', ans: 12, opts: [12, 60, 24, 6] },
        { q: '钟面上一共有几个小格？', ans: 60, opts: [60, 12, 30, 100] },
        { q: '一刻钟 = ? 分', ans: 15, opts: [15, 30, 45, 60] },
        { q: '分针走一大格是多少分？', ans: 5, opts: [5, 1, 10, 12] }
      ];
      return pool3[Math.floor(Math.random() * pool3.length)];
    }
    if (item.dyn === 'observe') {
      var pool4 = [
        { q: '同一个物体换个角度，看到的形状？', ans: '可能不同', opts: ['可能不同', '一定相同', '变没了', '变大'] },
        { q: '从上面看一个球，看到的是？', ans: '圆形', opts: ['圆形', '正方形', '三角形', '长方形'] },
        { q: '从前面看一个正方体，看到的是？', ans: '正方形', opts: ['正方形', '圆形', '三角形', '长方形'] },
        { q: '从上面看一个正方体，看到的是？', ans: '正方形', opts: ['正方形', '圆形', '三角形', '长方形'] },
        { q: '从侧面看一个圆柱，看到的是？', ans: '长方形', opts: ['长方形', '圆形', '正方形', '三角形'] },
        { q: '从上面看一个圆柱，看到的是？', ans: '圆形', opts: ['圆形', '长方形', '正方形', '三角形'] }
      ];
      return pool4[Math.floor(Math.random() * pool4.length)];
    }
    if (item.dyn === 'match') {
      var t2 = 2 + Math.floor(Math.random() * 2);
      var p2 = 2 + Math.floor(Math.random() * 3);
      var ans5 = t2 * p2;
      return { q: t2 + ' 件上衣配 ' + p2 + ' 条裤子，有几种搭配？', ans: ans5, opts: mkOpts(ans5, 1) };
    }
    if (item.dyn === 'divide') {
      var pl = 2 + Math.floor(Math.random() * 5);
      var ea = 2 + Math.floor(Math.random() * 7);
      var tot = pl * ea;
      return { q: tot + ' ÷ ' + pl + ' = ?', ans: ea, opts: mkOpts(ea, 1) };
    }
    if (item.dyn === 'remainder') {
      var pe = 3 + Math.floor(Math.random() * 5);
      var gg = 2 + Math.floor(Math.random() * 4);
      var lf = 1 + Math.floor(Math.random() * (pe - 1));
      var tt = pe * gg + lf;
      return { q: tt + ' ÷ ' + pe + ' = ' + gg + ' 余 ?', ans: lf, opts: mkOpts(lf, 1) };
    }
    if (item.dyn === 'bigNumber') {
      var pool5 = [
        { q: '一个数从右边起，第一位是什么位？', ans: '个位', opts: ['个位', '十位', '百位', '千位'] },
        { q: '一个数从右边起，第四位是什么位？', ans: '千位', opts: ['千位', '百位', '十位', '个位'] },
        { q: '10 个一百是多少？', ans: 1000, opts: [1000, 100, 10000, 110] },
        { q: '10 个一千是多少？', ans: 10000, opts: [10000, 1000, 100, 100000] }
      ];
      var pick = pool5[Math.floor(Math.random() * pool5.length)];
      /* 数字类题目也动态生成 */
      if (Math.random() < 0.5) {
        var n2 = 100 + Math.floor(Math.random() * 8900);
        var ds = String(n2);
        var idx = Math.floor(Math.random() * ds.length);
        var places = ['个位','十位','百位','千位'];
        var place = places[ds.length - 1 - idx];
        var digit = parseInt(ds[idx]);
        var opts2 = [digit];
        while (opts2.length < 4) {
          var cand = Math.floor(Math.random() * 10);
          if (opts2.indexOf(cand) < 0) opts2.push(cand);
        }
        opts2.sort(function(){return Math.random()-0.5});
        return { q: n2 + ' 的' + place + '是几？', ans: digit, opts: opts2 };
      }
      return pick;
    }
    if (item.dyn === 'weight') {
      var pool6 = [
        { q: '1 千克 = ? 克', ans: 1000, opts: [1000, 100, 10, 500] },
        { q: '一个鸡蛋约重多少？', ans: '50克', opts: ['50克', '50千克', '500克', '5克'] },
        { q: '一袋大米约重多少？', ans: '25千克', opts: ['25千克', '25克', '250克', '2千克'] },
        { q: '称体重用什么单位？', ans: '千克', opts: ['千克', '克', '米', '厘米'] }
      ];
      return pool6[Math.floor(Math.random() * pool6.length)];
    }
    if (item.dyn === 'translate') {
      var poolT = [
        { q: '推拉窗是什么运动？', ans: '平移', opts: ['平移', '旋转', '轴对称', '翻转'] },
        { q: '电梯上下是什么运动？', ans: '平移', opts: ['平移', '旋转', '轴对称', '摆动'] },
        { q: '抽屉拉出是什么运动？', ans: '平移', opts: ['平移', '旋转', '轴对称', '滚动'] },
        { q: '平移后图形的什么变了？', ans: '位置', opts: ['位置', '形状', '大小', '颜色'] }
      ];
      return poolT[Math.floor(Math.random() * poolT.length)];
    }
    if (item.dyn === 'rotate') {
      var poolR = [
        { q: '风车转动是什么运动？', ans: '旋转', opts: ['旋转', '平移', '轴对称', '滚动'] },
        { q: '钟表指针走动是什么运动？', ans: '旋转', opts: ['旋转', '平移', '轴对称', '滑动'] },
        { q: '旋转是绕着什么转？', ans: '一个点', opts: ['一个点', '一条线', '整个面', '没有'] },
        { q: '方向盘转动是什么运动？', ans: '旋转', opts: ['旋转', '平移', '轴对称', '摆动'] }
      ];
      return poolR[Math.floor(Math.random() * poolR.length)];
    }
    if (item.dyn === 'symmetry') {
      var poolS = [
        { q: '蝴蝶左右两边一样，是什么图形？', ans: '轴对称', opts: ['轴对称', '平移', '旋转', '圆'] },
        { q: '轴对称图形沿对称轴对折会怎样？', ans: '完全重合', opts: ['完全重合', '变成两个', '变大', '变颜色'] },
        { q: '正方形有几条对称轴？', ans: 4, opts: [4, 2, 1, 8] },
        { q: '长方形有几条对称轴？', ans: 2, opts: [2, 4, 1, 8] },
        { q: '圆有几条对称轴？', ans: '无数条', opts: ['无数条', '1条', '2条', '4条'] }
      ];
      return poolS[Math.floor(Math.random() * poolS.length)];
    }
    if (item.dyn === 'chart') {
      var dd = [];
      for (var z = 0; z < 4; z++) dd.push(2 + Math.floor(Math.random() * 8));
      var sum2 = dd.reduce(function (a, b) { return a + b; }, 0);
      var pool8 = [
        { q: '条形统计图中，柱子越高表示？', ans: '数量越多', opts: ['数量越多', '数量越少', '颜色越深', '越大越圆'] },
        { q: '统计图能帮我们做什么？', ans: '看清数量', opts: ['看清数量', '算加减法', '画图形', '量长度'] },
        { q: '苹果 ' + dd[0] + ' 个，香蕉 ' + dd[1] + ' 个，一共几个？', ans: dd[0] + dd[1], opts: mkOpts(dd[0] + dd[1], 1) }
      ];
      return pool8[Math.floor(Math.random() * pool8.length)];
    }
    return null;
  }

  /* 生成 4 个选项：1 正确 + 3 干扰 */
  function mkOpts(ans, spread) {
    var set = [ans];
    var guard = 0;
    while (set.length < 4 && guard++ < 200) {
      var delta = (Math.floor(Math.random() * 2) ? 1 : -1) *
                  (Math.floor(Math.random() * (spread * 5 + 3)) + 1);
      var v = ans + delta;
      if (v > 0 && set.indexOf(v) < 0) set.push(v);
    }
    /* 洗牌 */
    for (var i = set.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = set[i]; set[i] = set[j]; set[j] = tmp;
    }
    return set;
  }

  function openQuiz() {
    quizItem = CATALOG.filter(function (c) {
      return current && c.build === current._key;
    })[0];
    if (!quizItem) {
      /* 按顺序取，兜底第一个 */
      quizItem = CATALOG[0];
      for (var i = 0; i < CATALOG.length; i++) {
        if (current && CATALOG[i].name === current.name) { quizItem = CATALOG[i]; break; }
      }
    }
    var q = makeDynamicQuiz(quizItem) || quizItem.quiz;
    if (quizItem.dyn) {
      /* 动态题的选项每次重新洗牌 */
      var q2 = makeDynamicQuiz(quizItem);
      if (q2) q = q2;
    }
    quizQ.textContent = q.q;
    quizFb.textContent = '';
    quizOpts.innerHTML = '';
    q.opts.forEach(function (v) {
      var b = document.createElement('button');
      b.className = 'opt-btn';
      b.textContent = v;
      b.addEventListener('click', function () { answer(b, v, q); });
      quizOpts.appendChild(b);
    });
    quizLayer.classList.add('show');
    A.speak('算一算，答案是多少');
  }

  function answer(btn, val, q) {
    if (btn.disabled) return;
    var all = quizOpts.querySelectorAll('.opt-btn');
    for (var i = 0; i < all.length; i++) {
      all[i].disabled = true;
      if (all[i] !== btn) all[i].classList.add('dim');
    }

    if (val === q.ans) {
      btn.classList.add('right');
      A.sfx('right');
      quizFb.textContent = '答对啦，真棒！';
      quizFb.style.color = '#7ECB6F';
      A.speak('答对啦，真棒');
      var key = quizItem.id;
      save.stars[key] = Math.min(3, (save.stars[key] || 0) + 1);
      persist();

      if (challenge.on) {
        challenge.right++;
        challenge.idx++;
        updateChallengeBar();
        if (challenge.idx >= CHALLENGE_TOTAL) {
          setTimeout(function () {
            quizLayer.classList.remove('show');
            challenge.on = false;
            updateChallengeBar();
            celebrate();
            A.speak('闯关成功，全部答对');
          }, 800);
          return;
        }
        setTimeout(function () {
          quizLayer.classList.remove('show');
          setTimeout(function () { openQuiz(); }, 400);
        }, 800);
        return;
      }

      setTimeout(function () {
        quizLayer.classList.remove('show');
        celebrate();
      }, 900);
    } else {
      btn.classList.add('wrong');
      A.sfx('wrong');
      if (challenge.on) { challenge.wrong++; updateChallengeBar(); }
      quizFb.textContent = '再想一想哦～';
      quizFb.style.color = '#FF9DBB';
      A.speak('再想一想');
      setTimeout(function () {
        for (var j = 0; j < all.length; j++) {
          all[j].disabled = false;
          all[j].classList.remove('wrong', 'dim');
        }
      }, 900);
    }
  }

  /* ---------- 奖励特效 ---------- */
  var fx = fxCanvas.getContext('2d');
  var particles = [], fxRunning = false;
  function resizeFx() {
    var r = fxCanvas.getBoundingClientRect();
    fxCanvas.width = r.width * Math.min(devicePixelRatio || 1, 2);
    fxCanvas.height = r.height * Math.min(devicePixelRatio || 1, 2);
    fx.setTransform(fxCanvas.width / r.width, 0, 0, fxCanvas.height / r.height, 0, 0);
  }
  function spawn() {
    var r = fxCanvas.getBoundingClientRect();
    var kinds = ['star', 'flower', 'rainbow', 'petal'];
    for (var i = 0; i < 70; i++) {
      particles.push({
        x: r.width * 0.5 + (Math.random() - 0.5) * r.width * 0.7,
        y: r.height * 0.42 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 9 - 3,
        g: 0.24 + Math.random() * 0.13,
        s: 8 + Math.random() * 15,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.22,
        life: 1,
        kind: kinds[(Math.random() * kinds.length) | 0],
        color: ['#FFD166', '#FF9DBB', '#8ECAE6', '#8FD98F', '#C79BF5'][(Math.random() * 5) | 0]
      });
    }
  }
  function drawParticle(p) {
    fx.save();
    fx.translate(p.x, p.y);
    fx.rotate(p.rot);
    fx.globalAlpha = Math.max(0, p.life);
    fx.fillStyle = p.color;
    var s = p.s;
    if (p.kind === 'star') {
      fx.beginPath();
      for (var i = 0; i < 10; i++) {
        var rad = i % 2 ? s * 0.4 : s;
        var ang = (Math.PI / 5) * i - Math.PI / 2;
        fx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      fx.closePath(); fx.fill();
    } else if (p.kind === 'flower') {
      for (var k = 0; k < 5; k++) {
        fx.beginPath();
        fx.ellipse(Math.cos(k / 5 * Math.PI * 2) * s * 0.5,
                   Math.sin(k / 5 * Math.PI * 2) * s * 0.5, s * 0.42, s * 0.42, 0, 0, Math.PI * 2);
        fx.fill();
      }
      fx.fillStyle = '#FFF3B0';
      fx.beginPath(); fx.arc(0, 0, s * 0.3, 0, Math.PI * 2); fx.fill();
    } else if (p.kind === 'rainbow') {
      var cols = ['#FF9DBB', '#FFD166', '#8FD98F', '#8ECAE6'];
      for (var m = 0; m < 4; m++) {
        fx.strokeStyle = cols[m];
        fx.lineWidth = s * 0.2;
        fx.beginPath();
        fx.arc(0, 0, s * (0.5 + m * 0.2), 0, Math.PI * 2);
        fx.stroke();
      }
    } else {
      fx.beginPath();
      fx.ellipse(0, 0, s * 0.62, s * 0.36, 0, 0, Math.PI * 2);
      fx.fill();
    }
    fx.restore();
  }
  function fxLoop() {
    if (!fxRunning) return;
    var r = fxCanvas.getBoundingClientRect();
    fx.clearRect(0, 0, r.width, r.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr;
      if (p.y > r.height * 0.72) p.life -= 0.028;
      if (p.life <= 0 || p.y > r.height + 60) { particles.splice(i, 1); continue; }
      drawParticle(p);
    }
    requestAnimationFrame(fxLoop);
  }

  function celebrate() {
    resizeFx();
    spawn();
    A.sfx('win');
    setTimeout(function () { A.sfx('star'); }, 260);
    A.speak('太棒了，你学会了');
    rewardLayer.classList.add('show');
    fxRunning = true;
    requestAnimationFrame(fxLoop);
    setTimeout(function () {
      rewardLayer.classList.remove('show');
      setTimeout(function () {
        fxRunning = false;
        particles = [];
        var r = fxCanvas.getBoundingClientRect();
        fx.clearRect(0, 0, r.width, r.height);
      }, 450);
    }, 2400);
  }

  /* ---------- 声音面板 ---------- */
  var btnVoice = $('btnVoice'), btnSfx = $('btnSfx'), volRange = $('volRange');
  function syncSoundUI() {
    btnVoice.classList.toggle('off', !save.voice);
    btnVoice.querySelector('.ico').textContent = save.voice ? '🔊' : '🔇';
    btnSfx.classList.toggle('off', !save.sfx);
    btnSfx.querySelector('.ico').textContent = save.sfx ? '🎵' : '🔕';
    volRange.value = Math.round(save.vol * 100);
  }
  btnVoice.addEventListener('click', function () {
    save.voice = !save.voice;
    A.setVoiceOn(save.voice);
    A.sfx('click');
    syncSoundUI(); persist();
    if (save.voice) A.speak('声音已开启');
  });
  btnSfx.addEventListener('click', function () {
    save.sfx = !save.sfx;
    A.setSfxOn(save.sfx);
    if (save.sfx) A.sfx('click');
    syncSoundUI(); persist();
  });
  volRange.addEventListener('input', function () {
    save.vol = volRange.value / 100;
    A.setVolume(save.vol);
    persist();
  });

  /* ---------- 初始化 ---------- */
  A.setVoiceOn(save.voice);
  A.setSfxOn(save.sfx);
  A.setVolume(save.vol);
  syncSoundUI();
  buildGroundFlowers();
  buildHome();

  function buildGroundFlowers() {
    if (!groundFlowers) return;
    var icons = ['🌻', '🌷', '🌼', '🍀', '🌸', '🌱'];
    groundFlowers.innerHTML = '';
    for (var i = 0; i < 9; i++) {
      var f = document.createElement('span');
      f.className = 'gf';
      f.textContent = icons[i % icons.length];
      f.style.left = (4 + i * 11 + (i % 3) * 2) + '%';
      f.style.animationDelay = (i * 0.34) + 's';
      groundFlowers.appendChild(f);
    }
  }

  document.addEventListener('touchstart', function once() {
    A.unlock();
    document.removeEventListener('touchstart', once);
  }, { passive: true });
  document.addEventListener('click', function once() {
    A.unlock();
    document.removeEventListener('click', once);
  });

  /* 首页首次语音问候 */
  setTimeout(function () {
    A.speak('欢迎来到二年级数学动画课堂，上册下册都有，选一个知识点开始吧');
  }, 700);

  window.__APP__ = { CATALOG: CATALOG, celebrate: celebrate, save: save };
  }
})();
