/* ============================================================
   音频引擎 v2
   - 音效全部 Web Audio 现场合成，零外部文件
   - 拼音用「汉字锚定法」朗读：中文引擎读孤立字母会念成英文字母，
     必须给一个同音汉字才能读对（m -> 摸、y -> 衣）
   - 中文优先选童声女声（Yaoyao/Huihui），英文选 en-US
   ============================================================ */
const AudioKit = (() => {
  let ctx = null;
  let muted = false;

  /* ---------- 音效合成 ---------- */
  function ac(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type='sine', vol=0.2){
    const c = ac(); if(!c || muted) return;
    const osc = c.createOscillator(), gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    gain.gain.setValueAtTime(0.0001, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.05);
  }
  // 噪声（涂色刷刷声、气泡破裂）
  function noise(start, dur, vol=0.08){
    const c = ac(); if(!c || muted) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * (1 - i/len);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = vol;
    const f = c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1600;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(c.currentTime + start);
  }

  const correct = ()=> [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*0.07,0.26,'sine',0.19));
  const wrong   = ()=>{ tone(311.13,0,0.2,'triangle',0.15); tone(233.08,0.14,0.3,'triangle',0.15); };
  const click   = ()=> tone(880,0,0.06,'sine',0.08);
  const pick    = ()=> tone(660,0,0.08,'square',0.045);
  const star    = ()=>{ tone(1318.5,0,0.13,'sine',0.15); tone(1760,0.08,0.19,'sine',0.12); };
  const win     = ()=> [523.25,659.25,783.99,1046.5,783.99,1046.5,1318.5].forEach((f,i)=>tone(f,i*0.1,0.32,'sine',0.19));
  const pop     = ()=>{ noise(0,0.07,0.1); tone(1200,0,0.06,'sine',0.1); };
  const paint   = ()=>{ noise(0,0.05,0.05); };
  const whoosh  = ()=> tone(400,0,0.25,'sine',0.07);

  /* ---------- 语音 ---------- */
  let zhVoice = null, enVoice = null, ready = false;
  function loadVoices(){
    if(!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    if(!vs.length) return;
    // 中文优先顺序：童声 Yaoyao > 女声 Huihui > 其他中文
    zhVoice = vs.find(v=>/Yaoyao/i.test(v.name))
           || vs.find(v=>/Huihui/i.test(v.name))
           || vs.find(v=>/^zh/i.test(v.lang))
           || null;
    enVoice = vs.find(v=>/^en[-_]?US/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
    ready = true;
  }
  if('speechSynthesis' in window){
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    // 某些浏览器首次为空，稍后再试
    setTimeout(loadVoices, 300);
    setTimeout(loadVoices, 1200);
  }

  function speak(text, lang='zh-CN', rate=0.85, pitch=1.15){
    if(muted || !('speechSynthesis' in window) || text === undefined || text === null || text === '') return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      const v = lang.startsWith('en') ? enVoice : zhVoice;
      if(v) u.voice = v;
      speechSynthesis.speak(u);
    }catch(e){}
  }

  /* ---------- 拼音专用：汉字锚定 ---------- */
  // 声母表：拼音 -> 用于朗读的汉字（同音）
  const PINYIN_ANCHOR = {
    'b':'玻','p':'坡','m':'摸','f':'佛','d':'得','t':'特','n':'讷','l':'勒',
    'g':'哥','k':'科','h':'喝','j':'基','q':'欺','x':'希',
    'zh':'知','ch':'蚩','sh':'诗','r':'日','z':'资','c':'雌','s':'思',
    'y':'衣','w':'乌',
    'a':'啊','o':'喔','e':'鹅','i':'衣','u':'乌','ü':'迂',
    'ai':'哀','ei':'诶','ao':'熬','ou':'欧',
    'an':'安','en':'恩','ang':'昂','eng':'鞥',
    'ia':'呀','ie':'耶','iao':'腰','iu':'忧','ian':'烟','in':'因',
    'iang':'央','ing':'英','iong':'雍',
    'ua':'蛙','uo':'窝','uai':'歪','ui':'威','uan':'弯','un':'温',
    'uang':'汪','ong':'翁',
    'ba':'八','bo':'波','bi':'逼','bu':'不',
    'ma':'妈','mo':'摸','mi':'米','mu':'木',
    'pa':'趴','po':'坡','pi':'皮','pu':'铺',
    'fa':'发','fo':'佛','fu':'夫',
  };
  // 朗读一个拼音（声母/韵母/音节都走这里）
  function speakPinyin(py, rate=0.75){
    if(!py) return;
    const key = String(py).toLowerCase().replace(/[1-5]/g,'');
    // 元音单独处理：中文引擎读 'a' 会读成英文字母 A，必须换成汉字
    const anchor = PINYIN_ANCHOR[key];
    if(anchor){
      speak(anchor, 'zh-CN', rate, 1.2);
    }else{
      // 没有锚点就整体读，中文引擎碰到完整音节通常能读对
      speak(key, 'zh-CN', rate, 1.2);
    }
  }
  // 带声调的拼音，读整个音节
  function speakSyllable(py, rate=0.72){
    speak(String(py), 'zh-CN', rate, 1.2);
  }

  function toggleMute(){
    muted = !muted;
    if(muted && 'speechSynthesis' in window) speechSynthesis.cancel();
    return muted;
  }
  const isMuted = ()=> muted;
  const hasZhVoice = ()=> !!zhVoice;

  function unlock(){
    ac();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  }
  document.addEventListener('pointerdown', unlock, {once:true});
  document.addEventListener('keydown', unlock, {once:true});

  return { correct, wrong, click, pick, star, win, pop, paint, whoosh,
           speak, speakPinyin, speakSyllable, toggleMute, isMuted, hasZhVoice };
})();
