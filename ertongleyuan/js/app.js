/* ============================================================
   主程序 v2 —— 21 个游戏的路由、计分、成就
   ============================================================ */
const App = (()=>{
  const { $, $$, el, shuffle, rand, toast, confetti } = Kit;

  /* ---------- 学科 → 游戏映射 ---------- */
  const SUBJECTS = {
    chinese: {
      name:'语文乐园', emoji:'📖', color:'cn',
      desc:'拼音、汉字、古诗、儿歌、反义词',
      games:[ G_Pinyin, G_Stroke, G_Poem, G_Song, G_Antonym ]
    },
    math: {
      name:'数学乐园', emoji:'🔢', color:'math',
      desc:'数数、加减、形状、比大小、规律、钟表',
      games:[ G_Count, G_Math, G_Shape, G_Compare, G_Pattern, G_Clock ]
    },
    english: {
      name:'英语乐园', emoji:'🔤', color:'en',
      desc:'字母、单词、颜色、涂色、记忆',
      games:[ G_Letter, G_Color, G_Words, G_ColorFill, G_Memory ]
    },
    world: {
      name:'探索乐园', emoji:'🌍', color:'world',
      desc:'影子、好习惯、点泡泡、拼图、排排队',
      games:[ G_Bubble, G_Puzzle, G_Sort, G_Shadow, G_Habit ]
    },
  };

  /* ---------- 成就 ---------- */
  const ACHIEVEMENTS = [
    { id:'first',   icon:'🌟', name:'第一步',   need:1,   desc:'得到第一颗星星' },
    { id:'ten',     icon:'✨', name:'小星星',   need:10,  desc:'收集 10 颗星星' },
    { id:'fifty',   icon:'💫', name:'亮晶晶',   need:50,  desc:'收集 50 颗星星' },
    { id:'hundred', icon:'🏆', name:'百星达人', need:100, desc:'收集 100 颗星星' },
    { id:'all',     icon:'👑', name:'全能王',   need:200, desc:'收集 200 颗星星' },
  ];

  let stars = 0;
  let curSubject = null, curGameIdx = 0;
  let gameState = { solved:0, total:0 };

  /* ---------- 存储 ---------- */
  const KEY = 'kidsabc.v2';
  function load(){
    try{
      const d = JSON.parse(localStorage.getItem(KEY) || '{}');
      stars = d.stars || 0;
    }catch(e){ stars = 0; }
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify({ stars })); }catch(e){}
  }

  /* ---------- 计分 ---------- */
  function addStars(n){
    const before = stars;
    stars += n;
    save();
    const v = $('#scoreVal');
    if(v){ v.textContent = stars; }
    const pill = $('#scorePill');
    if(pill){
      pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump');
    }
    // 成就检测
    ACHIEVEMENTS.forEach(a=>{
      if(before < a.need && stars >= a.need){
        setTimeout(()=>{
          toast(a.icon + ' 解锁成就：' + a.name, 'info');
          AudioKit.win();
        }, 400);
      }
    });
    updateAchievements();
  }

  function updateAchievements(){
    const box = $('#achieveRow');
    if(!box) return;
    box.innerHTML = '';
    ACHIEVEMENTS.forEach(a=>{
      const d = el('div','ach' + (stars >= a.need ? ' got' : ''));
      d.innerHTML = '<span class="ach-icon">' + a.icon + '</span>' +
                    '<span class="ach-name">' + a.name + '</span>' +
                    '<span class="ach-need">' + a.need + '⭐</span>';
      d.title = a.desc + (stars >= a.need ? '（已达成）' : '');
      box.appendChild(d);
    });
  }

  /* ---------- 进度 ---------- */
  function progress(){
    gameState.solved++;
    const bar = $('#gameBar');
    if(bar && gameState.total > 0){
      const pct = Math.min(100, gameState.solved / gameState.total * 100);
      bar.style.width = pct + '%';
    }else if(bar){
      const cur = parseFloat(bar.style.width) || 0;
      bar.style.width = Math.min(100, cur + 14) + '%';
    }
  }
  function miss(){ /* 答错不扣分，保护信心 */ }
  function finish(msg){
    confetti(80);
    AudioKit.win();
    toast(msg, 'good');
    setTimeout(()=>AudioKit.speak(msg, 'zh-CN', 0.85), 380);
  }

  /* ---------- 视图切换 ---------- */
  function show(id){
    $$('.view').forEach(v=>v.classList.toggle('active', v.id === id));
    window.scrollTo({ top:0, behavior:'smooth' });
  }

  function openHome(){
    curSubject = null;
    $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav === 'home'));
    show('view-home');
    AudioKit.click();
  }

  function openSubject(key){
    curSubject = key;
    curGameIdx = 0;
    $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav === key));
    const s = SUBJECTS[key];
    if(!s) return;
    $('#subjTitle').textContent = s.emoji + ' ' + s.name;
    $('#subjSub').textContent = s.desc;
    renderTabs();
    startGame(0);
    show('view-subject');
    AudioKit.click();
    AudioKit.speak('欢迎来到' + s.name, 'zh-CN', 0.9);
  }

  function renderTabs(){
    const box = $('#gameTabs');
    box.innerHTML = '';
    SUBJECTS[curSubject].games.forEach((g,i)=>{
      const b = el('button','chip' + (i===curGameIdx?' active':''), g.icon + ' ' + g.title);
      b.type = 'button';
      b.onclick = ()=>{ curGameIdx = i; renderTabs(); startGame(i); AudioKit.click(); };
      box.appendChild(b);
    });
  }

  function startGame(i){
    const g = SUBJECTS[curSubject].games[i];
    if(!g) return;
    gameState = { solved:0, total:0 };
    const bar = $('#gameBar');
    if(bar) bar.style.width = '0%';
    const host = $('#gameHost');
    host.innerHTML = '';
    $('#gameHint').textContent = g.hint || '';

    const api = {
      addStars, progress, miss, finish,
      get stars(){ return stars; }
    };
    try{
      g.render(host, api);
    }catch(err){
      host.innerHTML = '<div class="hint-bar">这个游戏加载出了点小问题，换一个试试 👉</div>';
      console.error('游戏加载失败', g.title, err);
    }
  }

  /* ---------- 首页卡片 ---------- */
  function buildHome(){
    const grid = $('#subjectGrid');
    grid.innerHTML = '';
    Object.entries(SUBJECTS).forEach(([key,s])=>{
      const card = el('button','subject-card card-' + s.color);
      card.type = 'button';
      card.innerHTML = `
        <span class="shine"></span>
        <span class="sc-emoji">${s.emoji}</span>
        <h2>${s.name}</h2>
        <p>${s.desc}</p>
        <span class="go">共 ${s.games.length} 个游戏 →</span>`;
      for(let k=0;k<5;k++){
        const b = el('span','bubble');
        const sz = 10 + Math.random()*22;
        b.style.cssText = `width:${sz}px;height:${sz}px;left:${8+Math.random()*80}%;` +
          `bottom:${Math.random()*44}%;animation-duration:${3+Math.random()*2.5}s;` +
          `animation-delay:${-Math.random()*4}s;`;
        card.appendChild(b);
      }
      card.onclick = ()=>openSubject(key);
      card.onmouseenter = ()=>AudioKit.pick();
      grid.appendChild(card);
    });
    updateAchievements();
  }

  /* ---------- 启动 ---------- */
  function init(){
    load();
    buildHome();
    $('#scoreVal').textContent = stars;

    $$('.nav-btn').forEach(b=>{
      b.onclick = ()=>{
        const k = b.dataset.nav;
        if(k === 'home') openHome();
        else openSubject(k);
      };
    });
    $('.brand').onclick = openHome;
    $('#backHome').onclick = openHome;

    const mb = $('#muteBtn');
    if(mb){
      mb.onclick = ()=>{
        const m = AudioKit.toggleMute();
        mb.textContent = m ? '🔇 已静音' : '🔊 声音开';
        mb.classList.toggle('active', !m);
        if(!m) AudioKit.click();
      };
    }
    // 随机欢迎语
    setTimeout(()=>{
      if(AudioKit.hasZhVoice && AudioKit.hasZhVoice()){
        AudioKit.speak('欢迎来到快乐学习乐园，选一个喜欢的乐园开始吧', 'zh-CN', 0.92);
      }
    }, 900);
    openHome();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }

  return { addStars, progress, miss, finish, openSubject, toast };
})();