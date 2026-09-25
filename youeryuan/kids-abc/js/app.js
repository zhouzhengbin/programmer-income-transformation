/* ============================================================
   主程序：路由 / 导航 / 计分 / 游戏容器
   ============================================================ */
const App = (() => {
  const GAMES = {
    cn:    [GamePinyin, GameStroke],
    math:  [GameCount, GameMath],
    en:    [GameLetter, GameColor],
  };

  const SUBJECT = {
    cn:   { name:'语文乐园', emoji:'📖', tip:'拼音 · 汉字 · 儿歌' },
    math: { name:'数学乐园', emoji:'🔢', tip:'数数 · 加减 · 图形' },
    en:   { name:'英语乐园', emoji:'🔤', tip:'字母 · 单词 · 颜色' },
  };

  const $  = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

  let stars = 0;
  let currentSubject = null;
  let currentGameIdx = 0;
  let solvedThisGame = 0;
  let totalThisGame = 0;

  /* ---------- 计分 ---------- */
  function addStars(n){
    stars += n;
    const pill = $('#scoreVal');
    pill.textContent = stars;
    const box = $('#scorePill');
    box.classList.remove('bump');
    void box.offsetWidth;
    box.classList.add('bump');
    try{ localStorage.setItem('kidsabc.stars', String(stars)); }catch(e){}
  }

  function loadStars(){
    try{
      const v = parseInt(localStorage.getItem('kidsabc.stars') || '0', 10);
      if(!isNaN(v)) stars = v;
    }catch(e){}
    $('#scoreVal').textContent = stars;
  }

  /* ---------- 进度 ---------- */
  function progress(){
    solvedThisGame++;
    const bar = $('#gameBar');
    if(bar && totalThisGame > 0){
      bar.style.width = Math.min(100, Math.round(solvedThisGame/totalThisGame*100)) + '%';
    }
  }
  function miss(){ /* 错了不加分，也不扣分，保护孩子信心 */ }

  /* ---------- 提示条 ---------- */
  let toastTimer = null;
  function toast(msg, kind='good'){
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ t.classList.remove('show'); }, 2200);
  }

  /* ---------- 庆祝彩带 ---------- */
  function confetti(){
    const colors = ['#ff6b8b','#ffd93d','#4ecb71','#4aa8ff','#a06bff','#33d9c1','#ffa552'];
    for(let i=0;i<60;i++){
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random()*100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animation = `fall ${1.6 + Math.random()*1.6}s linear ${Math.random()*0.5}s forwards`;
      if(Math.random() > .6) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(()=>c.remove(), 4200);
    }
  }

  function finish(msg){
    confetti();
    AudioKit.win();
    toast(msg, 'good');
    toastTimer = setTimeout(()=>{}, 0);
    setTimeout(()=>{
      AudioKit.speak(msg, 'zh-CN', 0.85);
    }, 350);
  }

  /* ---------- 路由 ---------- */
  function show(viewId){
    $$('.view').forEach(v=>v.classList.toggle('active', v.id === viewId));
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function openHome(){
    currentSubject = null;
    $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav === 'home'));
    show('view-home');
    AudioKit.click();
    AudioKit.speak('欢迎来到快乐学习乐园，选一个你喜欢的乐园吧', 'zh-CN', 0.9);
  }

  function openSubject(key){
    currentSubject = key;
    currentGameIdx = 0;
    $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav === key));
    const s = SUBJECT[key];
    $('#subjTitle').textContent = s.emoji + ' ' + s.name;
    $('#subjSub').textContent = s.tip;
    renderGameTabs();
    startGame(0);
    show('view-subject');
    AudioKit.click();
  }

  function renderGameTabs(){
    const box = $('#gameTabs');
    box.innerHTML = '';
    GAMES[currentSubject].forEach((g, i)=>{
      const b = document.createElement('button');
      b.className = 'chip' + (i === currentGameIdx ? ' active' : '');
      b.textContent = g.title;
      b.onclick = ()=>{ currentGameIdx = i; renderGameTabs(); startGame(i); AudioKit.click(); };
      box.appendChild(b);
    });
  }

  function startGame(i){
    const g = GAMES[currentSubject][i];
    solvedThisGame = 0; totalThisGame = 0;
    const bar = $('#gameBar');
    if(bar) bar.style.width = '0%';
    $('#gameHost').innerHTML = '';
    $('#gameHint').textContent = g.hint || '';

    const api = { addStars, progress, miss, finish };

    // 估算本局总题量，用于进度条
    totalThisGame = 6;

    g.render($('#gameHost'), api);

    // 出题量不固定时，进度条按已得分平滑推进
    const origProgress = api.progress;
    api.progress = function(){
      origProgress();
      const b = $('#gameBar');
      if(b){
        const cur = parseFloat(b.style.width) || 0;
        if(cur < 100) b.style.width = Math.min(100, cur + 16) + '%';
      }
    };
  }

  /* ---------- 背景装饰 ---------- */
  function buildDeco(){
    const box = $('#bgDeco');
    const clouds = [
      { w:150, top:8,  dur:52, delay:0 },
      { w:96,  top:26, dur:68, delay:-18 },
      { w:190, top:52, dur:82, delay:-40 },
      { w:120, top:72, dur:60, delay:-28 },
    ];
    clouds.forEach(c=>{
      const d = document.createElement('div');
      d.className = 'cloud';
      d.style.cssText = `width:${c.w}px;height:${Math.round(c.w*0.34)}px;top:${c.top}vh;
        animation-duration:${c.dur}s;animation-delay:${c.delay}s;`;
      box.appendChild(d);
    });
    const cols = ['#ff6b8b','#ffd93d','#4ecb71','#4aa8ff','#a06bff'];
    cols.forEach((col,i)=>{
      const b = document.createElement('div');
      b.className = 'balloon';
      b.style.cssText = `left:${8 + i*19}%;top:${14 + (i%3)*22}vh;background:${col};
        animation-duration:${4.2 + i*0.6}s;animation-delay:${-i*0.9}s;`;
      box.appendChild(b);
    });
  }

  /* ---------- 学科卡片 ---------- */
  function buildSubjectCards(){
    const grid = $('#subjectGrid');
    const meta = [
      { key:'cn',   cls:'card-cn',   emoji:'📖', title:'语文乐园', desc:'拼音找朋友、汉字描红，在游戏里认字读书', go:'开始识字' },
      { key:'math', cls:'card-math', emoji:'🔢', title:'数学乐园', desc:'数一数、加减小火车，把数字玩明白',       go:'开始数数' },
      { key:'en',   cls:'card-en',   emoji:'🔤', title:'英语乐园', desc:'字母配对、颜色单词，开口说英语',         go:'开始 ABC' },
    ];
    meta.forEach((m,i)=>{
      const card = document.createElement('button');
      card.className = 'subject-card ' + m.cls;
      card.type = 'button';
      card.innerHTML = `
        <span class="shine"></span>
        <span class="sc-emoji">${m.emoji}</span>
        <h2>${m.title}</h2>
        <p>${m.desc}</p>
        <span class="go">${m.go} →</span>`;
      // 装饰泡泡
      for(let k=0;k<4;k++){
        const b = document.createElement('span');
        b.className = 'bubble';
        const sz = 10 + Math.random()*22;
        b.style.cssText = `width:${sz}px;height:${sz}px;left:${12+Math.random()*76}%;
          bottom:${Math.random()*40}%;animation-duration:${3+Math.random()*2.5}s;
          animation-delay:${-Math.random()*4}s;`;
        card.appendChild(b);
      }
      card.onclick = ()=>openSubject(m.key);
      card.onmouseenter = ()=>AudioKit.pick();
      grid.appendChild(card);
    });
  }

  /* ---------- 启动 ---------- */
  function init(){
    buildDeco();
    buildSubjectCards();
    loadStars();

    $$('.nav-btn').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.nav;
        if(k === 'home') openHome();
        else openSubject(k);
      };
    });
    $('.brand').onclick = openHome;
    $('#backHome').onclick = openHome;

    // 音量开关
    const mb = $('#muteBtn');
    mb.onclick = ()=>{
      const m = AudioKit.toggleMute();
      mb.textContent = m ? '🔇 声音已关' : '🔊 声音已开';
      mb.classList.toggle('active', !m);
      if(!m) AudioKit.click();
    };

    $('#toast').className = 'toast';
    openHome();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { addStars, progress, miss, finish, openSubject, toast };
})();
