/* ================= 存档 ================= */
var S={stars:0,prog:{},unlock:{1:true},cur:null,phase:0,qi:0,ok:0,no:0,learnStep:0};
function save(){try{localStorage.setItem('m2v2',JSON.stringify({stars:S.stars,prog:S.prog,unlock:S.unlock}))}catch(e){}}
function load(){try{var d=JSON.parse(localStorage.getItem('m2v2')||'{}');
  S.stars=d.stars||0;S.prog=d.prog||{};S.unlock=d.unlock||{};S.unlock[1]=true;}catch(e){S.unlock={1:true}}}

var app=document.getElementById('app'),stage=document.getElementById('stage');

/* ================= 拼音 ================= */
var PY={'长度单位':'cháng dù dān wèi','厘米':'lí mǐ','米':'mǐ','分米':'fēn mǐ','千米':'qiān mǐ','毫米':'háo mǐ',
'100以内加减法':'yǐ nèi jiā jiǎn fǎ','加法':'jiā fǎ','减法':'jiǎn fǎ','进位':'jìn wèi','退位':'tuì wèi','个位':'gè wèi','十位':'shí wèi','百位':'bǎi wèi','千位':'qiān wèi','万位':'wàn wèi',
'角的初步认识':'jiǎo de chū bù rèn shi','直角':'zhí jiǎo','锐角':'ruì jiǎo','钝角':'dùn jiǎo','顶点':'dǐng diǎn','边':'biān',
'表内乘法':'biǎo nèi chéng fǎ','口诀':'kǒu jué','乘':'chéng','加数':'jiā shù','被乘数':'bèi chéng shù',
'观察物体':'guān chá wù tǐ','正面':'zhèng miàn','侧面':'cè miàn','上面':'shàng miàn','后面':'hòu miàn','左面':'zuǒ miàn','右面':'yòu miàn',
'认识时间':'rèn shi shí jiān','时针':'shí zhēn','分针':'fēn zhēn','大格':'dà gé','小格':'xiǎo gé','秒针':'miǎo zhēn',
'数学广角':'shù xué guǎng jiǎo','搭配':'dā pèi','有序':'yǒu xù','重复':'chóng fù','遗漏':'yí lòu','组合':'zǔ hé',
'数据收集整理':'shù jù shōu jí zhěng lǐ','调查':'diào chá','正字':'zhèng zì','统计表':'tǒng jì biǎo','统计图':'tǒng jì tú','画正字':'huà zhèng zì',
'表内除法':'biǎo nèi chú fǎ','除法':'chú fǎ','平均分':'píng jūn fēn','被除数':'bèi chú shù','除数':'chú shù','商':'shāng','除以':'chú yǐ',
'图形的运动':'tú xíng de yùn dòng','平移':'píng yí','旋转':'xuán zhuǎn','轴对称':'zhóu duì chèn','对称轴':'duì chèn zhóu','对称':'duì chèn',
'混合运算':'hùn hé yùn suàn','括号':'kuò hào','先算':'xiān suàn','后算':'hòu suàn','从左往右':'cóng zuǒ wǎng yòu',
'有余数的除法':'yǒu yú shù de chú fǎ','余数':'yú shù','商':'shāng','还剩余':'hái shèng yú',
'万以内数的认识':'wàn yǐ nèi shù de rèn shi','一万':'yī wàn','一千':'yī qiān','一百':'yī bǎi','数位':'shù wèi','读作':'dú zuò','写作':'xiě zuò',
'克和千克':'kè hé qiān kè','克':'kè','千克':'qiān kè','重量':'zhòng liàng','质量':'zhì liàng',
'推理':'tuī lǐ','排除法':'pái chú fǎ','关键':'guān jiàn','可能':'kě néng','一定':'yí dìng',
'万以内数的加减法':'wàn yǐ nèi shù de jiā jiǎn fǎ','估算':'gū suàn','大约':'dà yuē','约等于':'yuē děng yú'};
function renderPy(text){
  var ks=Object.keys(PY).sort(function(a,b){return b.length-a.length});
  var h='',i=0;
  while(i<text.length){
    var hit=null;
    for(var k=0;k<ks.length;k++){ if(text.substr(i,ks[k].length)===ks[k]){hit=ks[k];break} }
    if(hit){h+='<ruby>'+hit+'<rt>'+PY[hit]+'</rt></ruby>';i+=hit.length}
    else{h+=text[i];i++}
  }
  return h;
}

/* ================= 通用 ================= */
function scr(html){ app.innerHTML=html; }
function topbar(left,center,right){
  return '<div class="top">'+left+(center||'<div class="flex1"></div>')+(right||'')+'</div>';
}
function starBar(cur,total,label){
  return '<div class="bar" style="margin:clamp(6px,1.4vmin,10px) 0"><i id="pbar" style="width:'+(total?cur/total*100:0)+'%"></i></div>';
}

/* ================= 首页 ================= */
function home(){
  Voice.stop();
  var allQ=0,doneQ=0,allU=UNITS.length,doneU=0;
  for(var i=0;i<UNITS.length;i++){ allQ+=UNITS[i].qs.length;
    if(S.prog[UNITS[i].id]){ doneQ+=UNITS[i].qs.length; doneU++; } }
  var h='<div class="screen on"><div class="home">';
  h+='<div class="owl">🦉</div>';
  h+='<div class="ttl">数学小勇士</div>';
  h+='<div class="sub">ÈR NIÁN JÍ · 二年级</div>';
  h+='<div class="stat-row">';
  h+='<div class="stat"><div class="n">'+S.stars+'</div><div class="l">⭐ 星星</div></div>';
  h+='<div class="stat"><div class="n">'+doneU+'/'+allU+'</div><div class="l">📚 关卡</div></div>';
  h+='<div class="stat"><div class="n">'+allQ+'</div><div class="l">✏️ 题目</div></div>';
  h+='</div>';
  h+='<button class="btn g full" id="bStart" style="max-width:420px;font-size:clamp(18px,3.4vmin,26px);padding:clamp(15px,2.8vmin,22px)">🚀 开始学习闯关</button>';
  h+='<button class="btn b full" id="bMap" style="max-width:420px">📚 全部知识点地图</button>';
  h+='<div class="sub" style="font-size:clamp(9px,1.7vmin,12px);letter-spacing:.2em;margin-top:4px">先学习 · 再讲解 · 后游戏</div>';
  h+='</div></div>';
  scr(h);
  document.getElementById('bStart').onclick=function(){SFX.init();SFX.tap();map() };
  document.getElementById('bMap').onclick=function(){SFX.init();SFX.tap();map() };
  Voice.say('欢迎来到数学小勇士！二年级数学大冒险，我们先把知识学一遍，再做游戏闯关，一起出发吧！',{rate:.88});
}

/* ================= 关卡地图 ================= */
function map(){
  Voice.stop();
  var h='<div class="screen on pad">';
  h+=topbar('<button class="mini" id="bH">🏠 首页</button>','<div class="flex1"></div>','<div class="chip">⭐<span class="v" id="sv">'+S.stars+'</span></div>');
  var doneU=0; for(var i=0;i<UNITS.length;i++) if(S.prog[UNITS[i].id]) doneU++;
  h+=starBar(doneU,UNITS.length);
  h+='<div class="flex1 scroll" style="margin-top:clamp(8px,1.8vmin,14px)"><div class="map" id="mb"></div></div>';
  h+='</div>';
  scr(h);
  document.getElementById('bH').onclick=function(){SFX.tap();home()};
  var mb=document.getElementById('mb');
  for(var j=0;j<UNITS.length;j++){
    var u=UNITS[j], lk=S.unlock[u.id];
    var st=S.prog[u.id]||0;
    var ss='';
    for(var s=0;s<3;s++) ss+= s<st?'★':'☆';
    var d=document.createElement('div');
    d.className='lv'+(lk?'':' lock');
    d.style.setProperty('--c1',u.c1); d.style.setProperty('--c2',u.c2);
    d.style.animation='scrIn .5s backwards cubic-bezier(.16,1,.3,1)';
    d.style.animationDelay=(j*0.035)+'s';
    d.innerHTML='<div class="ic">'+u.icon+'</div><div class="nm">'+u.name+'</div><div class="py">'+u.pinyin+'</div>'
      +'<div class="sts">'+ss+'</div><div class="bg2">'+u.qs.length+'题</div>';
    (function(u,lk){ d.onclick=function(){
      SFX.init();
      if(!lk){SFX.no();Voice.say('这一关还没有解锁，先完成前面的关卡吧');return}
      SFX.tap(); startLearn(u);
    }})(u,lk);
    mb.appendChild(d);
  }
}

/* ================= 阶段一：学习讲解 ================= */
function startLearn(u){
  S.cur=u; S.learnStep=0; S.qi=0; S.ok=0; S.no=0;
  renderLearn();
}
function renderLearn(){
  Voice.stop();
  var u=S.cur, steps=u.learn, i=S.learnStep, st=steps[i], last=(i===steps.length-1);
  var h='<div class="screen on pad">';
  h+=topbar('<button class="mini" id="bB">← 返回</button>','<div class="flex1"></div>'
    ,'<div class="chip">📖 <span class="v">学习 '+(i+1)+'/'+steps.length+'</span></div>');
  h+=starBar(i+1,steps.length);
  h+='<div class="flex1 scroll" style="margin-top:clamp(8px,1.8vmin,14px);display:flex;flex-direction:column;gap:clamp(8px,1.8vmin,14px)">';
  if(i===0){
    h+='<div class="learn-hero" style="--c1:'+u.c1+';--c2:'+u.c2+'">';
    h+='<div class="e">'+u.icon+'</div><div class="t">'+u.name+'</div><div class="p">'+u.pinyin+'</div></div>';
  }
  h+='<div class="card">';
  h+='<div class="step-h"><div class="step-n">'+(i+1)+'</div><div class="step-t">'+renderPy(st.t)+'<em>'+st.py+'</em></div></div>';
  h+='<div class="big-idea">'+st.d+'</div>';
  if(st.tip) h+='<div class="tipbox">💡 <b>小提示</b><br>'+st.tip+'</div>';
  if(st.demo) h+='<div class="demo" id="demo">'+st.demo+'</div>';
  h+='</div>';
  h+='</div>';
  h+='<div style="display:flex;gap:clamp(7px,1.6vmin,12px);padding-top:clamp(8px,1.8vmin,14px)">';
  if(i>0) h+='<button class="btn b" id="bPrev" style="flex:1">← 上一步</button>';
  h+='<button class="btn '+(last?'pk':'g')+'" id="bNext" style="flex:2">'+(last?'✏️ 开始练习':'下一步 →')+'</button>';
  h+='</div></div>';
  scr(h);
  document.getElementById('bB').onclick=function(){SFX.tap();map()};
  if(i>0) document.getElementById('bPrev').onclick=function(){SFX.page();S.learnStep--;renderLearn()};
  document.getElementById('bNext').onclick=function(){SFX.init();SFX.page();
    if(last){startQuiz()}else{S.learnStep++;renderLearn()}};
  var plain=st.t.replace(/<[^>]+>/g,'');
  Voice.say(plain,{rate:.84});
}

/* ================= 阶段二：练习 ================= */
function startQuiz(){ S.qi=0; S.ok=0; S.no=0; renderQuiz(); }
function renderQuiz(){
  Voice.stop();
  var u=S.cur;
  if(S.qi>=u.qs.length) return finish();
  var q=u.qs[S.qi];
  var h='<div class="screen on pad">';
  h+=topbar('<button class="mini" id="bB">← 退出</button>','<div class="flex1"></div>'
    ,'<div class="chip">✏️ <span class="v">'+(S.qi+1)+'/'+u.qs.length+'</span></div>');
  h+=starBar(S.qi,u.qs.length);
  h+='<div class="flex1 scroll" style="margin-top:clamp(8px,1.8vmin,14px)">';
  h+='<div class="qcard">';
  h+='<div class="qtop"><div class="qemo">'+q.e+'</div><div class="qtxt">'+renderPy(q.q)+'</div></div>';
  h+='<div class="opts" id="ops"></div>';
  h+='<div class="fdbk" id="fb"></div>';
  h+='</div></div>';
  h+='<div style="padding-top:clamp(8px,1.8vmin,14px)"><button class="btn p full" id="bSpeak">🔊 再听一遍题目</button></div>';
  h+='</div>';
  scr(h);
  document.getElementById('bB').onclick=function(){SFX.tap();map()};
  document.getElementById('bSpeak').onclick=function(){SFX.tap();Voice.say(q.q,{rate:.82})};
  var ops=document.getElementById('ops');
  for(var i=0;i<q.o.length;i++){
    var b=document.createElement('button'); b.className='opt';
    b.innerHTML=String.fromCharCode(65+i)+'. '+q.o[i];
    (function(i,b){ b.onclick=function(){ pick(i,b,q,ops) } })(i,b);
    ops.appendChild(b);
  }
  Voice.say(q.q,{rate:.82});
}
function pick(idx,btn,q,ops){
  var all=ops.querySelectorAll('.opt');
  for(var i=0;i<all.length;i++) all[i].disabled=true;
  var fb=document.getElementById('fb');
  if(idx===q.a){
    btn.classList.add('ok'); SFX.ok(); showFx('✔ 答对啦','#4ade80'); confetti(24);
    S.ok++; S.stars++; save();
    fb.className='fdbk show good';
    fb.innerHTML='🎉 <b>太棒了！</b><br>'+q.why;
    Voice.say('答对啦！'+q.why,{rate:.84});
    setTimeout(function(){S.qi++;renderQuiz()},1900);
  }else{
    btn.classList.add('no'); all[q.a].classList.add('ok');
    SFX.no(); showFx('✘ 想一想','#f87171'); S.no++;
    fb.className='fdbk show bad';
    fb.innerHTML='💡 <b>正确答案是 '+String.fromCharCode(65+q.a)+'</b><br>'+q.why;
    Voice.say('再想一想哦。'+q.why,{rate:.82});
    setTimeout(function(){S.qi++;renderQuiz()},2700);
  }
}

/* ================= 阶段三：结算 ================= */
function finish(){
  Voice.stop();
  var u=S.cur, total=u.qs.length, rate=S.ok/total;
  var st=rate>=.9?3:(rate>=.7?2:(rate>=.5?1:0));
  if(st>(S.prog[u.id]||0)) S.prog[u.id]=st;
  S.unlock[u.id+1]=true; save();
  SFX.win(); confetti(90);
  var h='<div class="screen on"><div class="fin">';
  h+='<div class="bi">'+(st>=3?'🏆':st>=2?'🎉':'💪')+'</div>';
  h+='<h2>'+(st>=3?'完美通关！':st>=2?'闯关成功！':'继续加油！')+'</h2>';
  h+='<div class="stars-b">';
  for(var i=0;i<3;i++) h+='<span style="animation-delay:'+(i*.2)+'s">'+(i<st?'⭐':'☆')+'</span>';
  h+='</div>';
  h+='<div class="card" style="width:min(92%,430px);text-align:center">';
  h+='<div style="font-size:clamp(16px,3vmin,22px);font-weight:900;margin-bottom:6px">'+u.name+'</div>';
  h+='<div style="font-size:clamp(12px,2.2vmin,16px);color:#5a6480">答对 <b style="color:#16a34a;font-size:clamp(18px,3.6vmin,26px)">'+S.ok+'</b> / '+total+' 题</div>';
  h+='<div style="font-size:clamp(11px,2vmin,14px);color:#8b93b0;margin-top:5px">累计 ⭐ '+S.stars+' 颗</div>';
  h+='</div>';
  h+='<button class="btn g full" id="bN" style="max-width:430px">'+(u.id<UNITS.length?'下一关 →':'🏠 回到首页')+'</button>';
  h+='<button class="btn b full" id="bRe" style="max-width:430px;font-size:clamp(14px,2.4vmin,18px)">📖 再学一遍</button>';
  h+='<button class="btn p full" id="bRe2" style="max-width:430px;font-size:clamp(14px,2.4vmin,18px)">🔄 再练一次</button>';
  h+='</div></div>';
  scr(h);
  document.getElementById('bN').onclick=function(){SFX.tap();
    if(u.id<UNITS.length) startLearn(UNITS[u.id]); else home()};
  document.getElementById('bRe').onclick=function(){SFX.tap();startLearn(u)};
  document.getElementById('bRe2').onclick=function(){SFX.tap();startQuiz()};
  Voice.say('恭喜你完成'+u.name+'，答对了'+S.ok+'题，获得'+S.ok+'颗星星！',{rate:.86});
}

/* ================= 语音开关 ================= */
var spk=document.getElementById('spk');
spk.onclick=function(){
  var on=Voice.toggle(); SFX.toggle();
  spk.textContent=on?'🔊':'🔇'; spk.className=on?'':'off';
  if(on) Voice.say('语音已开启');
};

/* ================= 启动 ================= */
load(); home();
document.body.addEventListener('touchstart',function o1(){SFX.init();document.body.removeEventListener('touchstart',o1)},{passive:true});
document.body.addEventListener('click',function o2(){SFX.init();document.body.removeEventListener('click',o2)});
