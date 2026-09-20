/* ========== 语音引擎（在线 TTS） ========== */
var Voice=(function(){
  var on=true,zh=null;
  function pick(){ if(!('speechSynthesis' in window))return;
    var vs=speechSynthesis.getVoices()||[];
    zh=vs.filter(function(v){return /zh[-_]?CN|Chinese|中文|普通话|Huihui|Yaoyao|Xiaoxiao|Kangkang|Tingting/i.test(v.lang+v.name)})[0]
      || vs.filter(function(v){return /^zh/i.test(v.lang)})[0] || null; }
  if('speechSynthesis' in window){ pick(); speechSynthesis.onvoiceschanged=pick; setTimeout(pick,300); setTimeout(pick,1000); }
  return {
    say:function(t,o){ if(!on||!t)return; o=o||{};
      try{ speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(String(t)); u.lang='zh-CN';
        if(zh)u.voice=zh; u.rate=o.rate||0.86; u.pitch=o.pitch||1.18; u.volume=1;
        speechSynthesis.speak(u); }catch(e){} },
    stop:function(){ try{speechSynthesis.cancel()}catch(e){} },
    toggle:function(){ on=!on; if(!on)this.stop(); return on; },
    isOn:function(){ return on; }
  };
})();

/* ========== 音效引擎（WebAudio 合成） ========== */
var SFX=(function(){
  var c=null,on=true;
  function ac(){ if(!c){ var C=window.AudioContext||window.webkitAudioContext; if(!C)return null; c=new C(); }
    if(c.state==='suspended'){try{c.resume()}catch(e){}} return c; }
  function tn(f,d,t,v,dl){ if(!on)return; var a=ac(); if(!a)return;
    var t0=a.currentTime+(dl||0),o=a.createOscillator(),g=a.createGain();
    o.type=t||'sine'; o.frequency.setValueAtTime(f,t0);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(v||.16,t0+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(g); g.connect(a.destination); o.start(t0); o.stop(t0+d+.03); }
  function nz(d,v){ if(!on)return; var a=ac(); if(!a)return;
    var n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);
    for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.5);
    var s=a.createBufferSource(); s.buffer=b; var g=a.createGain(); g.gain.value=v||.22;
    s.connect(g); g.connect(a.destination); s.start(); }
  return {
    init:function(){ac()},
    tap:function(){tn(620,.07,'sine',.1)},
    swipe:function(){tn(440,.1,'triangle',.08)},
    ok:function(){[523.25,659.25,783.99,1046.5].forEach(function(f,i){tn(f,.3,'sine',.18,i*.08)})},
    no:function(){tn(200,.25,'sawtooth',.13);tn(158,.33,'sawtooth',.11,.1)},
    star:function(){[880,1174.7,1568].forEach(function(f,i){tn(f,.22,'triangle',.15,i*.06)})},
    win:function(){[523.25,587.33,659.25,783.99,880,1046.5,1318.5].forEach(function(f,i){tn(f,.42,'sine',.19,i*.095)});nz(.6,.1)},
    page:function(){tn(700,.09,'triangle',.09);tn(950,.09,'triangle',.07,.05)},
    toggle:function(){on=!on;return on},
    isOn:function(){return on}
  };
})();

/* ========== 特效 ========== */
function confetti(n,fromY){
  n=n||40; var st=document.getElementById('stage');
  var cols=['#ff6b9d','#4facfe','#ffd93d','#6bcf7f','#a06bff','#ff9f43','#ff4757','#00d2d3','#ff5f9e','#7bf08d'];
  for(var i=0;i<n;i++){(function(i){setTimeout(function(){
    var d=document.createElement('div'); d.className='conf';
    d.style.left=Math.random()*100+'%';
    d.style.background=cols[Math.floor(Math.random()*cols.length)];
    if(Math.random()>.55)d.style.borderRadius='50%';
    d.style.width=(6+Math.random()*9)+'px'; d.style.height=(10+Math.random()*10)+'px';
    var du=1.8+Math.random()*1.6; d.style.animationDuration=du+'s';
    st.appendChild(d); setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},du*1000+100);
  },i*28)})(i)}
}
function showFx(txt,color){
  var fx=document.getElementById('fx'); fx.textContent=txt;
  fx.style.color=color||'#ffd93d';
  fx.style.textShadow='0 7px 0 rgba(0,0,0,.35),0 0 44px '+(color||'#ffd93d');
  fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go');
  setTimeout(function(){fx.classList.remove('go')},1000);
}

/* ========== 背景构建 ========== */
(function buildBg(){
  var bg=document.getElementById('bg');
  var oc=['#ff6b9d','#4facfe','#a06bff','#ffd93d','#00d2d3','#ff9f43'];
  for(var i=0;i<5;i++){
    var o=document.createElement('div'); o.className='orb';
    var sz=120+Math.random()*220;
    o.style.width=sz+'px'; o.style.height=sz+'px';
    o.style.left=(Math.random()*100)+'%'; o.style.top=(Math.random()*100)+'%';
    o.style.background=oc[i%oc.length];
    o.style.animationDelay=(Math.random()*8)+'s';
    o.style.animationDuration=(14+Math.random()*12)+'s';
    bg.appendChild(o);
  }
  for(var j=0;j<60;j++){
    var s=document.createElement('div'); s.className='star';
    var s2=1+Math.random()*2.6;
    s.style.width=s2+'px'; s.style.height=s2+'px';
    s.style.left=(Math.random()*100)+'%'; s.style.top=(Math.random()*100)+'%';
    s.style.animationDelay=(Math.random()*3)+'s';
    s.style.animationDuration=(2+Math.random()*2.6)+'s';
    bg.appendChild(s);
  }
  var em=['➕','➖','✖️','➗','📏','🕐','⭐','🔢','📐','⚖️','🎨','🧮'];
  for(var k=0;k<12;k++){
    var e=document.createElement('div'); e.className='float-e'; e.textContent=em[k%em.length];
    e.style.left=(Math.random()*100)+'%'; e.style.bottom='-60px';
    e.style.animationDuration=(16+Math.random()*18)+'s';
    e.style.animationDelay=(Math.random()*16)+'s';
    e.style.fontSize=(18+Math.random()*24)+'px';
    bg.appendChild(e);
  }
})();
