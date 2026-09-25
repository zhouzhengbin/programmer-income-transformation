/* ============================================================
   音频引擎：全部用 Web Audio 现场合成，零外部资源
   - 正确音 / 错误音 / 点击音 / 升级音
   - 中文、英文语音朗读（浏览器 SpeechSynthesis）
   ============================================================ */
const AudioKit = (() => {
  let ctx = null;
  let muted = false;

  function ac(){
    if(!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      ctx = new AC();
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // 单个音符
  function tone(freq, start, dur, type='sine', vol=0.22){
    const c = ac(); if(!c || muted) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    gain.gain.setValueAtTime(0.0001, c.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.05);
  }

  // 上行琶音：答对了
  function correct(){
    [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=>tone(f, i*0.075, 0.28, 'sine', 0.2));
  }
  // 下行两音：再试试
  function wrong(){
    tone(311.13, 0, 0.2, 'triangle', 0.16);
    tone(233.08, 0.14, 0.3, 'triangle', 0.16);
  }
  // 轻点
  function click(){ tone(880, 0, 0.07, 'sine', 0.09); }
  // 拿起来
  function pick(){ tone(660, 0, 0.09, 'square', 0.05); }
  // 全部完成
  function win(){
    const notes = [523.25,659.25,783.99,1046.5,783.99,1046.5,1318.5];
    notes.forEach((f,i)=>tone(f, i*0.11, 0.34, 'sine', 0.2));
  }
  // 星星入账
  function star(){ tone(1318.5,0,0.14,'sine',0.16); tone(1760,0.09,0.2,'sine',0.13); }

  /* ---- 语音朗读 ---- */
  let zhVoice = null, enVoice = null;
  function loadVoices(){
    if(!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    if(!vs.length) return;
    zhVoice = vs.find(v=>/zh[-_]?CN|Chinese|Xiaoxiao|Yaoyao|Huihui/i.test(v.lang+v.name)) || null;
    enVoice = vs.find(v=>/^en[-_]?US|en-US/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
  }
  if('speechSynthesis' in window){
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text, lang='zh-CN', rate=0.85){
    if(muted || !('speechSynthesis' in window) || !text) return;
    try{
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = lang;
      u.rate = rate;
      u.pitch = 1.15;          // 稍高一点，更像老师/小朋友
      const v = lang.startsWith('en') ? enVoice : zhVoice;
      if(v) u.voice = v;
      speechSynthesis.speak(u);
    }catch(e){ /* 语音不可用时静默降级 */ }
  }

  function toggleMute(){ muted = !muted; if(muted && 'speechSynthesis' in window) speechSynthesis.cancel(); return muted; }
  function isMuted(){ return muted; }

  // 首次交互解锁音频（移动端策略）
  function unlock(){
    ac();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('keydown', unlock);
  }
  document.addEventListener('pointerdown', unlock, {once:true});
  document.addEventListener('keydown', unlock, {once:true});

  return { correct, wrong, click, pick, win, star, speak, toggleMute, isMuted };
})();
