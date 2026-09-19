/* =========================================================
   和AI做朋友 —— 低龄儿童AI启蒙 H5
   Part 1: 拼音引擎 / 语音 / 工具函数
   ========================================================= */

/* ---------- 1. 拼音表（仅覆盖本页用字，多音字取页面语境读音） ---------- */
var PY = {
  "和":"hé","做":"zuò","朋":"péng","友":"yǒu","小":"xiǎo","的":"de","第":"dì","一":"yī","课":"kè",
  "我":"wǒ","是":"shì","谁":"shuí","机":"jī","器":"qì","人":"rén","你":"nǐ","好":"hǎo","呀":"ya",
  "认":"rèn","识":"shí","拥":"yōng","抱":"bào","学":"xué","会":"huì","驾":"jià","驭":"yù",
  "点":"diǎn","我":"wǒ","听":"tīng","吧":"ba","开":"kāi","始":"shǐ","探":"tàn","险":"xiǎn",
  "什":"shén","么":"me","能":"néng","帮":"bāng","们":"men","怎":"zěn","跟":"gēn","说":"shuō","话":"huà",
  "积":"jī","木":"mù","编":"biān","程":"chéng","安":"ān","全":"quán","知":"zhī","测":"cè","试":"shì",
  "结":"jié","束":"shù","收":"shōu","获":"huò","勋":"xūn","章":"zhāng","太":"tài","棒":"bàng","了":"le",
  "它":"tā","不":"bù","真":"zhēn","但":"dàn","很":"hěn","聪":"cōng","明":"míng","有":"yǒu","个":"gè",
  "大":"dà","脑":"nǎo","袋":"dai","里":"lǐ","装":"zhuāng","着":"zhe","好":"hǎo","多":"duō","本":"běn","领":"lǐng",
  "像":"xiàng","伙":"huǒ","伴":"bàn","陪":"péi","着":"zhe","玩":"wán","画":"huà","讲":"jiǎng","故":"gù","事":"shì",
  "回":"huí","答":"dá","问":"wèn","题":"tí","唱":"chàng","歌":"gē","翻":"fān","译":"yì","看":"kàn","图":"tú",
  "写":"xiě","字":"zì","算":"suàn","数":"shù","记":"jì","单":"dān","词":"cí","陪":"péi","聊":"liáo","天":"tiān",
  "要":"yào","清":"qīng","楚":"chu","想":"xiǎng","法":"fǎ","给":"gěi","提":"tí","求":"qiú","告":"gào","诉":"su",
  "它":"tā","做":"zuò","先":"xiān","再":"zài","然":"rán","后":"hòu","比":"bǐ","如":"rú","请":"qǐng","画":"huà",
  "只":"zhī","猫":"māo","要":"yào","红":"hóng","色":"sè","的":"de","在":"zài","草":"cǎo","地":"dì","上":"shàng",
  "很":"hěn","多":"duō","太":"tài","少":"shǎo","不":"bù","懂":"dǒng","换":"huàn","句":"jù","慢":"màn","慢":"màn",
  "下":"xià","次":"cì","还":"hái","可":"kě","以":"yǐ","更":"gèng","加":"jiā","具":"jù","体":"tǐ","呢":"ne",
  "如":"rú","果":"guǒ","答":"dá","错":"cuò","了":"le","别":"bié","着":"zháo","急":"jí","自":"zì","己":"jǐ",
  "动":"dòng","脑":"nǎo","筋":"jīn","试":"shì","一":"yī","试":"shì","问":"wèn","老":"lǎo","师":"shī","家":"jiā","长":"zhǎng",
  "重":"zhòng","要":"yào","规":"guī","则":"zé","守":"shǒu","秘":"mì","密":"mì","信":"xìn","息":"xī","姓":"xìng","名":"míng",
  "住":"zhù","址":"zhǐ","电":"diàn","话":"huà","号":"hào","码":"mǎ","学":"xué","校":"xiào","密":"mì","码":"mǎ",
  "都":"dōu","是":"shì","不":"bù","能":"néng","告":"gào","诉":"su","别":"bié","人":"rén","的":"de",
  "遇":"yù","到":"dào","奇":"qí","怪":"guài","的":"de","话":"huà","赶":"gǎn","紧":"jǐn","找":"zhǎo","爸":"bà","爸":"ba","妈":"mā","妈":"ma",
  "每":"měi","天":"tiān","只":"zhǐ","用":"yòng","一":"yī","会":"huì","儿":"ér","保":"bǎo","护":"hù","眼":"yǎn","睛":"jing",
  "顺":"shùn","序":"xù","判":"pàn","断":"duàn","重":"chóng","复":"fù","直":"zhí","到":"dào","完":"wán","成":"chéng",
  "搭":"dā","积":"jī","木":"mù","指":"zhǐ","令":"lìng","小":"xiǎo","游":"yóu","戏":"xì","闯":"chuǎng","关":"guān",
  "排":"pái","好":"hǎo","队":"duì","啦":"la","啦":"la","太":"tài","厉":"lì","害":"hai","啦":"la",
  "再":"zài","想":"xiǎng","想":"xiǎng","答":"dá","对":"duì","得":"dé","星":"xīng","星":"xing","愿":"yuàn","意":"yì",
  "扫":"sǎo","一":"yī","扫":"sǎo","收":"shōu","藏":"cáng","彩":"cǎi","蛋":"dàn","秘":"mì","密":"mì","惊":"jīng","喜":"xǐ",
  "握":"wò","手":"shǒu","从":"cóng","今":"jīn","以":"yǐ","后":"hòu","就":"jiù","是":"shì","好":"hǎo","朋":"péng","友":"yǒu","啦":"la",
  "准":"zhǔn","备":"bèi","出":"chū","发":"fā","探":"tàn","索":"suǒ","乐":"lè","园":"yuán","欢":"huān","迎":"yíng",
  "今":"jīn","日":"rì","任":"rèn","务":"wù","拿":"ná","齐":"qí","三":"sān","枚":"méi","勋":"xūn","章":"zhāng",
  "你":"nǐ","真":"zhēn","是":"shì","个":"gè","小":"xiǎo","天":"tiān","才":"cái","全":"quán","部":"bù","通":"tōng","关":"guān",
  "再":"zài","玩":"wán","一":"yī","次":"cì","去":"qù","看":"kàn","看":"kàn","我":"wǒ","的":"de","奖":"jiǎng","章":"zhāng",
  "谁":"shéi","在":"zài","说":"shuō","话":"huà","原":"yuán","来":"lái","是":"shì","你":"nǐ","听":"tīng","到":"dào","啦":"la",
  "选":"xuǎn","择":"zé","正":"zhèng","确":"què","获":"huò","得":"dé","奖":"jiǎng","励":"lì","继":"jì","续":"xù","加":"jiā","油":"yóu",
  "把":"bǎ","拖":"tuō","到":"dào","正":"zhèng","确":"què","位":"wèi","置":"zhì","上":"shàng","吧":"ba"
};

/* ---------- 2. 工具函数 ---------- */
function $(s, r){ return (r||document).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }

/* 把含汉字的文本自动包成 <ruby>，非汉字原样保留 */
function py(html){
  return html.replace(/[\u4e00-\u9fa5]/g, function(ch){
    var p = PY[ch];
    if(!p) return ch;
    return "<ruby>" + ch + "<rt>" + p + "</rt></ruby>";
  });
}

/* 去掉标签，得到纯文本（给语音用） */
function plain(html){
  var d = document.createElement("div");
  d.innerHTML = html;
  return (d.textContent || "").replace(/\s+/g, " ").trim();
}

/* ---------- 3. 语音引擎 ---------- */
var Sound = (function(){
  var on = true, voice = null, ready = false;

  function pickVoice(){
    if(!("speechSynthesis" in window)) return;
    var vs = window.speechSynthesis.getVoices() || [];
    if(!vs.length) return;
    var prefer = [
      /Huihui|慧慧/i, /Xiaoxiao|晓晓/i, /Tingting|婷婷/i,
      /Yaoyao|瑶瑶/i, /Xiaoyi|小艺/i, /zh[-_]CN/i, /zh/i
    ];
    for(var i=0;i<prefer.length;i++){
      for(var j=0;j<vs.length;j++){
        if(prefer[i].test(vs[j].name) || prefer[i].test(vs[j].lang)){
          voice = vs[j]; ready = true; return;
        }
      }
    }
    voice = vs[0]; ready = true;
  }

  if("speechSynthesis" in window){
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function speak(text, opt){
    if(!on || !text) return;
    if(!("speechSynthesis" in window)){
      if(window.__toast) window.__toast("这个浏览器不支持语音哦");
      return;
    }
    try{ window.speechSynthesis.cancel(); }catch(e){}
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    /* 中文是声调语言：pitch 必须保持 1.0，否则声调曲线被破坏，听不清 */
    u.rate = (opt && opt.rate) || 0.98;   /* 接近正常语速，清晰不拖沓 */
    u.pitch = (opt && opt.pitch) || 1.0;  /* 原声，保住四声 */
    u.volume = 1;
    if(voice) u.voice = voice;
    /* 长句切分，避免合成器一口气读太长导致糊音 */
    window.speechSynthesis.speak(u);
  }

  return {
    speak: speak,
    toggle: function(){
      on = !on;
      if(!on && "speechSynthesis" in window){ try{ window.speechSynthesis.cancel(); }catch(e){} }
      return on;
    },
    isOn: function(){ return on; }
  };
})();

/* ---------- 4. 奖励 / 粒子 ---------- */
var Stars = {
  n: 0,
  add: function(k){
    this.n += (k||1);
    var el = $("#starN");
    if(el){
      el.textContent = this.n;
      el.parentNode.style.animation = "none";
      void el.parentNode.offsetWidth;
      el.parentNode.style.animation = "pop .45s cubic-bezier(.34,1.56,.64,1)";
    }
  }
};

var FX = (function(){
  /* 已升级为 Canvas 粒子引擎，保留原接口以兼容游戏逻辑 */
  function burst(x, y, n, opt){
    if(window.Stage) Stage.burst(x, y, n || 10, opt);
  }
  function init(){
    if(window.Stage) Stage.init();
  }
  return {
    init: init,
    burst: burst,
    rain: function(n){ if(window.Stage) Stage.rain(n || 30); },
    ripple: function(x, y, c){ if(window.Stage) Stage.ripple(x, y, c); }
  };
})();

var toastTimer = null;
function toast(msg){
  var t = $("#toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 1700);
}
window.__toast = toast;

/* =========================================================
   Part 2: 页面结构（8 屏）
   ========================================================= */

/* ---------- 卡通主角 SVG：圆滚滚的小机器人 ---------- */
function mascotSVG(opt){
  opt = opt || {};
  var id = opt.id || "mascotMain";
  return "<div class=\"mascot\"><svg id=\"" + id + "\" viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\" aria-label=\"AI小机器人\">" +
    /* 天线 */
    "<line x1=\"100\" y1=\"26\" x2=\"100\" y2=\"52\" stroke=\"#9B7BF0\" stroke-width=\"7\" stroke-linecap=\"round\"/>" +
    "<circle cx=\"100\" cy=\"20\" r=\"11\" fill=\"#FFC93C\"><animate attributeName=\"r\" values=\"11;14;11\" dur=\"1.6s\" repeatCount=\"indefinite\"/></circle>" +
    /* 手臂 */
    "<rect class=\"arm-l\" x=\"18\" y=\"96\" width=\"26\" height=\"16\" rx=\"8\" fill=\"#7BC8F6\"/>" +
    "<rect class=\"arm-r\" x=\"156\" y=\"92\" width=\"28\" height=\"16\" rx=\"8\" fill=\"#7BC8F6\"/>" +
    /* 身体 */
    "<rect x=\"44\" y=\"56\" width=\"112\" height=\"102\" rx=\"40\" fill=\"#FFFFFF\" stroke=\"#C9B6FF\" stroke-width=\"6\"/>" +
    /* 脸屏 */
    "<rect x=\"60\" y=\"74\" width=\"80\" height=\"62\" rx=\"28\" fill=\"#EAF6FF\"/>" +
    /* 眼睛 */
    "<circle class=\"eye\" cx=\"82\" cy=\"102\" r=\"8\" fill=\"#4A3B32\"/>" +
    "<circle class=\"eye\" cx=\"118\" cy=\"102\" r=\"8\" fill=\"#4A3B32\"/>" +
    "<circle cx=\"85\" cy=\"99\" r=\"2.6\" fill=\"#fff\"/>" +
    "<circle cx=\"121\" cy=\"99\" r=\"2.6\" fill=\"#fff\"/>" +
    /* 微笑 */
    "<path d=\"M88 118 Q100 130 112 118\" stroke=\"#FF7BA9\" stroke-width=\"5\" fill=\"none\" stroke-linecap=\"round\"/>" +
    /* 腮红 */
    "<ellipse cx=\"72\" cy=\"120\" rx=\"8\" ry=\"5\" fill=\"#FFB3C7\" opacity=\".85\"/>" +
    "<ellipse cx=\"128\" cy=\"120\" rx=\"8\" ry=\"5\" fill=\"#FFB3C7\" opacity=\".85\"/>" +
    /* 小脚 */
    "<rect x=\"68\" y=\"156\" width=\"24\" height=\"14\" rx=\"7\" fill=\"#FFD75E\"/>" +
    "<rect x=\"108\" y=\"156\" width=\"24\" height=\"14\" rx=\"7\" fill=\"#FFD75E\"/>" +
  "</svg></div>";
}

/* ---------- 通用小图标 ---------- */
function iconRow(list){
  return "<div class=\"grid2\">" + list.map(function(it, i){
    return "<div class=\"tile\" data-say=\"" + it.say + "\" style=\"background:" + it.bg + "\">" +
      "<span class=\"ico\">" + it.ico + "</span>" +
      "<span class=\"lab\">" + py(it.lab) + "</span></div>";
  }).join("") + "</div>";
}

/* ---------- 构建全部页面 ---------- */
function buildPages(){
  var stage = $("#stage");
  var H = [];

  /* ===== 0 首页 ===== */
  H.push(
    "<section class=\"page\" id=\"p0\" style=\"--pg-bg:radial-gradient(120% 80% at 50% 0%,#FFF0F5 0%,#FFF6E5 60%,#FFF6E5 100%)\">" +
      "<div class=\"sun\"></div><div class=\"cloud c1\"></div><div class=\"cloud c2\"></div>" +
      mascotSVG({id:"mascotMain"}) +
      "<h1 class=\"title-big pop-in\">" + py("和AI做朋友") + "</h1>" +
      "<p class=\"soft\" style=\"margin-top:2px\">" + py("小朋友的AI第一课") + "</p>" +
      "<div class=\"bubble tail\" style=\"margin-top:16px;text-align:center\" data-say=\"你好呀，我是AI小机器人。点我一下，我就说话啦。" +
        "今天我们一起认识AI，还要学会驾驭它。准备好了吗？\">" +
        "<div class=\"big-line\">" + py("你好呀，我是AI小机器人") + "</div>" +
        "<p class=\"soft\" style=\"margin-bottom:0\">" + py("点我一下，我就说话啦") + "</p>" +
      "</div>" +
      "<div style=\"display:flex;flex-wrap:wrap;justify-content:center;margin-top:6px\">" +
        "<button class=\"btn\" id=\"startBtn\">" + py("出发，开始探险") + " 🚀</button>" +
      "</div>" +
      "<p class=\"soft\" style=\"margin-top:14px;font-size:.92rem\">" + py("往下滑，还有七个小关卡在等你") + "</p>" +
    "</section>"
  );

  /* ===== 1 什么是 AI ===== */
  H.push(
    "<section class=\"page\" id=\"p1\" style=\"--pg-bg:linear-gradient(180deg,#FFF6E5,#FFEFF6)\">" +
      mascotSVG({id:"m1"}) +
      "<h2 class=\"h2\">" + py("什么是AI呀") + "</h2>" +
      "<div class=\"card\" style=\"text-align:center\">" +
        "<div class=\"big-line\" data-say=\"AI就像一个很聪明的机器人小伙伴。它不会自己变聪明，是很多叔叔阿姨教它学会的。\">" +
          py("AI是聪明的机器人小伙伴") + "</div>" +
        "<p data-say=\"它有一个大大的脑袋，里面装着好多本领。你问它问题，它就会想一想，再回答你。\">" +
          py("它有个大脑袋，装着好多本领") + "</p>" +
        "<p data-say=\"它不会自己变聪明哦，是很多叔叔阿姨教它，它才学会的。\" class=\"soft\">" +
          py("它不会自己变聪明哦") + "</p>" +
      "</div>" +
      "<button class=\"btn blue\" data-goto=\"p2\" style=\"margin-top:16px\">" + py("它还能做什么呢") + " 👀</button>" +
    "</section>"
  );

  /* ===== 2 AI 能做什么 ===== */
  H.push(
    "<section class=\"page\" id=\"p2\" style=\"--pg-bg:linear-gradient(180deg,#FFEFF6,#EAF6FF)\">" +
      "<h2 class=\"h2\">" + py("AI可以帮我们做什么") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("点一点，听听它怎么说") + "</p>" +
      iconRow([
        {ico:"🎨", lab:"画画", bg:"#FFF3E0", say:"AI可以帮你画画。你说想要一只红色的猫，它就画出来啦。"},
        {ico:"📖", lab:"讲故事", bg:"#EDE7FF", say:"AI可以讲故事。你想听小兔子的故事，它就讲给你听。"},
        {ico:"❓", lab:"回答问题", bg:"#E4F5FF", say:"AI可以回答问题。为什么天会下雨呀？它会慢慢告诉你。"},
        {ico:"🎵", lab:"唱歌", bg:"#E9FBEA", say:"AI可以唱歌。它还会编出新的小儿歌呢。"},
        {ico:"🔤", lab:"翻译", bg:"#FFF0F4", say:"AI可以翻译。中文和英文，它都能帮你换过来。"},
        {ico:"🧮", lab:"算数", bg:"#FFF8E0", say:"AI可以帮你检查算数题，看看有没有算错。"}
      ]) +
      "<button class=\"btn purple\" data-goto=\"p3\" style=\"margin-top:18px\">" + py("那怎么让它听我的话") + " 🤔</button>" +
    "</section>"
  );

  /* ===== 3 如何驾驭 AI ===== */
  H.push(
    "<section class=\"page\" id=\"p3\" style=\"--pg-bg:linear-gradient(180deg,#EAF6FF,#F0FFF0)\">" +
      "<h2 class=\"h2\">" + py("学会驾驭AI") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("好好说话，它才听得懂") + "</p>" +
      "<div class=\"step\" data-say=\"第一步，把话说清楚。告诉它你想要什么。\">" +
        "<span class=\"num\">1</span><span class=\"txt\">" + py("把话说清楚") + "</span></div>" +
      "<div class=\"step\" data-say=\"第二步，告诉它越多细节，它做得越好。\">" +
        "<span class=\"num\" style=\"background:#5FCF6B\">2</span><span class=\"txt\">" + py("说清楚细节") + "</span></div>" +
      "<div class=\"step\" data-say=\"第三步，如果它做错了，就再说一次，慢慢教它。\">" +
        "<span class=\"num\" style=\"background:#4FB8F5\">3</span><span class=\"txt\">" + py("说错了就再说一次") + "</span></div>" +
      "<p class=\"soft\" style=\"margin-top:14px\">" + py("下面两句话，哪句更好呢") + "</p>" +
      "<div class=\"compare\">" +
        "<div class=\"cmp bad\" data-say=\"这句话太短啦，AI不知道你想要什么。\">" +
          "<span class=\"tag\">" + py("这样说不太好") + "</span>" +
          "<span class=\"say\">" + py("画个画") + "</span></div>" +
        "<div class=\"cmp good\" data-say=\"这句话很好，说清楚了画什么，什么颜色，在哪里。\">" +
          "<span class=\"tag\">" + py("这样说真棒") + "</span>" +
          "<span class=\"say\">" + py("请画一只红色的小猫，在草地上") + "</span></div>" +
      "</div>" +
      "<button class=\"btn green\" data-goto=\"p4\" style=\"margin-top:18px\">" + py("来玩指令小游戏") + " 🎮</button>" +
    "</section>"
  );

  /* ===== 4 游戏1：给AI下指令 ===== */
  H.push(
    "<section class=\"page\" id=\"p4\" style=\"--pg-bg:linear-gradient(180deg,#F0FFF0,#FFF8E0)\">" +
      "<h2 class=\"h2\">" + py("游戏一 给AI下指令") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("按顺序点卡片，帮AI听懂你的话") + "</p>" +
      "<div class=\"slots\" id=\"g1slots\"><span class=\"soft\" id=\"g1hint\" style=\"font-size:.95rem\">" + py("点下面的卡片放这里") + "</span></div>" +
      "<div class=\"pool\" id=\"g1pool\"></div>" +
      "<div id=\"aiResult\"></div>" +
      "<div style=\"display:flex;flex-wrap:wrap;justify-content:center;margin-top:6px\">" +
        "<button class=\"btn\" id=\"g1run\" disabled>" + py("让AI做做看") + " ✨</button>" +
        "<button class=\"btn blue\" id=\"g1reset\">" + py("重新来") + " 🔄</button>" +
      "</div>" +
    "</section>"
  );

  /* ===== 5 游戏2：积木逻辑拖拽 ===== */
  H.push(
    "<section class=\"page\" id=\"p5\" style=\"--pg-bg:linear-gradient(180deg,#FFF8E0,#EDE7FF)\">" +
      "<h2 class=\"h2\">" + py("游戏二 积木排排队") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("按住积木，把顺序排对") + "</p>" +
      "<div class=\"card\" style=\"padding:14px 16px;margin-bottom:12px;text-align:center\">" +
        "<div style=\"font-size:1.05rem;font-weight:800\">" + py("任务：让小机器人走到小花园") + "</div>" +
        "<p class=\"soft\" style=\"margin:4px 0 0;font-size:.92rem\">" + py("一步一步来，顺序不能乱哦") + "</p>" +
      "</div>" +
      "<div class=\"blocks\" id=\"g2blocks\"></div>" +
      "<div style=\"display:flex;flex-wrap:wrap;justify-content:center;margin-top:14px\">" +
        "<button class=\"btn green\" id=\"g2run\">" + py("开始走一走") + " 🚶</button>" +
        "<button class=\"btn blue\" id=\"g2reset\">" + py("重来") + " 🔄</button>" +
      "</div>" +
    "</section>"
  );

  /* ===== 6 安全小课堂 ===== */
  H.push(
    "<section class=\"page\" id=\"p6\" style=\"--pg-bg:linear-gradient(180deg,#EDE7FF,#FFEFF6)\">" +
      "<h2 class=\"h2\">" + py("AI安全小课堂") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("三条小规则，一定要记住") + "</p>" +
      "<div class=\"step\" data-say=\"第一条，不能把名字、住址、电话、学校告诉AI，也不能告诉网上的陌生人。\">" +
        "<span class=\"num\" style=\"background:#F08A63\">🔒</span><span class=\"txt\">" + py("家里的秘密不说出去") + "</span></div>" +
      "<div class=\"step\" data-say=\"第二条，AI也会说错话。想一想，再问问爸爸妈妈和老师。\">" +
        "<span class=\"num\" style=\"background:#FFC93C\">🤔</span><span class=\"txt\">" + py("AI也会说错，要动脑想一想") + "</span></div>" +
      "<div class=\"step\" data-say=\"第三条，遇到奇怪的话或者吓人的话，赶快告诉爸爸妈妈。\">" +
        "<span class=\"num\" style=\"background:#5FCF6B\">💬</span><span class=\"txt\">" + py("遇到奇怪的话，告诉爸爸妈妈") + "</span></div>" +
      "<div class=\"card\" style=\"margin-top:14px;background:#E4F5FF;text-align:center\">" +
        "<div style=\"font-size:1.06rem;font-weight:900\">" + py("每天只玩一会儿，保护小眼睛") + " 👀</div>" +
      "</div>" +
      "<button class=\"btn purple\" data-goto=\"p7\" style=\"margin-top:16px\">" + py("我要去闯关啦") + " 🏅</button>" +
    "</section>"
  );

  /* ===== 7 知识小测试 ===== */
  H.push(
    "<section class=\"page\" id=\"p7\" style=\"--pg-bg:linear-gradient(180deg,#FFEFF6,#E9FBEA)\">" +
      "<h2 class=\"h2\">" + py("游戏三 知识小闯关") + "</h2>" +
      "<p class=\"soft\" style=\"margin-top:-6px\">" + py("答对一题，得到一枚勋章") + "</p>" +
      "<div class=\"qbox card\" id=\"g3box\"></div>" +
      "<div class=\"medals\" id=\"g3medals\"></div>" +
      "<button class=\"btn green\" id=\"g3finish\" style=\"display:none;margin-top:18px\">" + py("看看我的奖章") + " 🏆</button>" +
    "</section>"
  );

  /* ===== 8 结束页 ===== */
  H.push(
    "<section class=\"page\" id=\"p8\" style=\"--pg-bg:radial-gradient(110% 70% at 50% 0%,#FFF3D6 0%,#FFF6E5 60%,#FFF6E5 100%)\">" +
      "<div class=\"sun\"></div>" +
      mascotSVG({id:"m8"}) +
      "<h1 class=\"title-big\">" + py("你真棒，全部通关") + "</h1>" +
      "<div class=\"card\" style=\"text-align:center;margin-top:14px\">" +
        "<div class=\"big-line\" data-say=\"你已经认识了AI，学会了好好跟它说话，还记住了安全小规则。你真棒！\">" +
          py("你已经是AI小专家啦") + "</div>" +
        "<p class=\"soft\" style=\"margin-bottom:0\">" + py("记得把今天学的，讲给爸爸妈妈听") + "</p>" +
      "</div>" +
      "<div class=\"medals\" id=\"p8medals\" style=\"margin-top:18px\"></div>" +
      "<div style=\"display:flex;flex-wrap:wrap;justify-content:center;margin-top:8px\">" +
        "<button class=\"btn\" id=\"againBtn\">" + py("再玩一次") + " 🔁</button>" +
      "</div>" +
      "<p class=\"soft\" style=\"margin-top:18px;font-size:.9rem\">" + py("和AI做朋友 · 小朋友的AI第一课") + "</p>" +
    "</section>"
  );

  stage.innerHTML = H.join("");
}

/* =========================================================
   Part 3: 游戏逻辑 / 语音绑定 / 进度 / 启动
   ========================================================= */

var State = { stars: 0, g1: false, g2: false, g3done: false };

var MEDALS = [
  {id:"a", ico:"🎯", lab:"会下指令"},
  {id:"b", ico:"🧩", lab:"会排积木"},
  {id:"c", ico:"🛡️", lab:"安全小卫士"}
];

function renderMedals(host, got){
  if(!host) return;
  host.innerHTML = MEDALS.map(function(m){
    return "<div class=\"medal" + (got[m.id] ? " got" : "") + "\">" +
      m.ico + "<span class=\"mlab\">" + m.lab + "</span></div>";
  }).join("");
}

function gotMedals(){
  var g = {};
  if(State.g1) g.a = 1;
  if(State.g2) g.b = 1;
  if(State.g3done) g.c = 1;
  return g;
}

function award(){
  var g = gotMedals();
  renderMedals($("#g3medals"), g);
  renderMedals($("#p8medals"), g);
}

/* =========================================================
   游戏一：给 AI 下指令
   ========================================================= */
var G1 = (function(){
  var RAW = ["请", "画一只小猫", "红色的", "在草地上", "吧", "随便"];
  var pool = [];
  var order = [0,1,2,3];
  var picked = [];

  function shuffle(a){
    for(var i=a.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0; var t=a[i];a[i]=a[j];a[j]=t; }
    return a;
  }

  function render(){
    var p = $("#g1pool");
    p.innerHTML = pool.map(function(c, i){
      return "<button class=\"chip" + (c.used ? " used" : "") + "\" data-i=\"" + i + "\">" + py(c.t) + "</button>";
    }).join("");
    var s = $("#g1slots");
    if(!picked.length){
      s.innerHTML = "<span class=\"soft\" style=\"font-size:.95rem\">" + py("点下面的卡片放这里") + "</span>";
    } else {
      s.innerHTML = picked.map(function(i){
        return "<span class=\"slot\">" + py(pool[i].t) + "</span>";
      }).join("");
    }
    $("#g1run").disabled = picked.length !== 4;
  }

  function pick(i){
    if(pool[i].used) return;
    pool[i].used = true;
    picked.push(i);
    render();
  }

  function reset(){
    pool.forEach(function(c){ c.used = false; });
    picked = [];
    var r = $("#aiResult"); if(r) r.style.display = "none";
    render();
  }

  function run(){
    var ok = picked.length===4 && picked.every(function(v, idx){ return v === order[idx]; });
    var box = $("#aiResult");
    box.style.display = "block";
    if(ok){
      box.innerHTML = "<div style=\"font-size:2.6rem\">🤖🎨</div>" +
        "<div>" + py("哇，AI听懂了你的话") + "</div>" +
        "<p class=\"soft\" style=\"margin:6px 0 0\">" + py("说清楚，按顺序，它就做得对") + "</p>";
      FX.burst(window.innerWidth/2, window.innerHeight*0.62, 16, {lift:4.6});
      FX.rain(18);
      toast("得到一颗星星");
      Stars.add(1);
      if(!State.g1){ State.g1 = true; award(); }
      Sound.speak("太棒啦。你把话说清楚了，AI就听懂啦。");
    } else {
      box.innerHTML = "<div style=\"font-size:2.6rem\">🤖❓</div>" +
        "<div>" + py("AI有点没听懂") + "</div>" +
        "<p class=\"soft\" style=\"margin:6px 0 0\">" + py("把话说完整，再按顺序放") + "</p>";
      Sound.speak("再想一想哦。先说请，再说画什么，然后说颜色，最后说在哪里。");
    }
  }

  function init(){
    var idx = shuffle([0,1,2,3,4,5]);
    pool = idx.map(function(i){ return {t:RAW[i], used:false}; });
    order = [0,1,2,3].map(function(k){ return idx.indexOf(k); });
    $("#g1pool").addEventListener("click", function(e){
      var b = e.target.closest(".chip");
      if(!b) return;
      pick(+b.dataset.i);
    });
    $("#g1run").addEventListener("click", run);
    $("#g1reset").addEventListener("click", reset);
    render();
  }
  return {init:init, reset:reset};
})();

/* =========================================================
   游戏二：积木排排队
   ========================================================= */
var G2 = (function(){
  var CORRECT = [
    {t:"第一步 站起来", c:"b1"},
    {t:"第二步 向前走三步", c:"b2"},
    {t:"第三步 向右转", c:"b3"},
    {t:"第四步 到达小花园", c:"b4"}
  ];
  var cur = [];
  var dragEl = null;

  function render(){
    $("#g2blocks").innerHTML = cur.map(function(b, i){
      return "<div class=\"blk " + b.c + "\" data-i=\"" + i + "\">" +
        "<span class=\"grip\">⠿</span><span>" + py(b.t) + "</span></div>";
    }).join("");
  }

  function isRight(){
    for(var i=0;i<cur.length;i++){ if(cur[i].t !== CORRECT[i].t) return false; }
    return true;
  }

  function swap(a, b){
    if(a===b) return;
    var t = cur[a]; cur[a] = cur[b]; cur[b] = t;
    render();
  }

  function reset(){
    cur = CORRECT.slice();
    do {
      for(var i=cur.length-1;i>0;i--){ var j=(Math.random()*(i+1))|0; var t=cur[i];cur[i]=cur[j];cur[j]=t; }
    } while(isRight());
    dragEl = null;
    render();
  }

  function run(){
    if(isRight()){
      toast("顺序全对，太厉害啦");
      FX.burst(window.innerWidth/2, window.innerHeight*0.55, 18, {lift:4.8});
      FX.rain(20);
      Stars.add(1);
      if(!State.g2){ State.g2 = true; award(); }
      Sound.speak("顺序全对。一步一步来，事情就做好啦。你真棒。");
    } else {
      var first = 0;
      for(var i=0;i<cur.length;i++){ if(cur[i].t !== CORRECT[i].t){ first = i; break; } }
      toast("第" + (first+1) + "块好像不太对哦");
      Sound.speak("第" + (first+1) + "块积木放错啦。想一想，先做什么，再做什么？");
    }
  }

  function init(){
    reset();
    var host = $("#g2blocks");
    var fromIdx = -1;

    host.addEventListener("pointerdown", function(e){
      var b = e.target.closest(".blk");
      if(!b) return;
      dragEl = b; fromIdx = +b.dataset.i;
      b.classList.add("dragging");
    });

    function hitTest(x, y){
      var el = document.elementFromPoint(x, y);
      return el && el.closest ? el.closest(".blk") : null;
    }
    function clearOver(){
      Array.prototype.forEach.call(host.querySelectorAll(".blk"), function(x){ x.classList.remove("over"); });
    }

    function onMove(e){
      if(!dragEl || !dragEl.isConnected) return;
      var tgt = hitTest(e.clientX, e.clientY);
      clearOver();
      if(tgt && tgt !== dragEl) tgt.classList.add("over");
    }

    function detach(){
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    }

    function onUp(e){
      detach();
      if(!dragEl) return;
      var src = dragEl;
      /* 用实时下标，避免 render 后旧下标失效 */
      var from = +src.dataset.i;
      src.classList.remove("dragging");
      var tgt = hitTest(e.clientX, e.clientY);
      clearOver();
      dragEl = null; fromIdx = -1;
      if(tgt && tgt !== src) swap(from, +tgt.dataset.i);
    }

    host.addEventListener("pointerdown", function(e){
      var b = e.target.closest(".blk");
      if(!b) return;
      /* 先清掉可能残留的监听器，防止累积触发多次交换 */
      detach();
      dragEl = b; fromIdx = +b.dataset.i;
      b.classList.add("dragging");
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      e.preventDefault();
    });

    $("#g2run").addEventListener("click", run);
    $("#g2reset").addEventListener("click", reset);
  }

  return {init:init, reset:reset};
})();

/* =========================================================
   游戏三：知识小闯关
   ========================================================= */
var G3 = (function(){
  var QS = [
    { q:"AI最像下面哪一个",
      opts:[{t:"聪明的机器人小伙伴",ok:true},{t:"会飞的小鸟",ok:false},{t:"一棵大树",ok:false}],
      tip:"AI就像一个聪明的机器人小伙伴。" },
    { q:"想让AI画小猫，怎么说最好",
      opts:[{t:"画个东西",ok:false},{t:"请画一只红色的小猫，在草地上",ok:true},{t:"随便",ok:false}],
      tip:"说得越清楚，AI做得越好。" },
    { q:"有人问你住在哪里，该怎么做",
      opts:[{t:"马上告诉他",ok:false},{t:"不告诉，赶快找爸爸妈妈",ok:true},{t:"写在评论里",ok:false}],
      tip:"家里的秘密不能告诉别人，要找爸爸妈妈帮忙。" },
    { q:"AI说的话，一定都对吗",
      opts:[{t:"一定都对",ok:false},{t:"不一定，要自己想一想",ok:true}],
      tip:"AI也会说错，我们要动脑想一想。" }
  ];
  var i = 0, answered = false;

  function render(){
    var box = $("#g3box");
    if(i >= QS.length){
      box.innerHTML = "<div style=\"text-align:center\">" +
        "<div style=\"font-size:3rem\">🎉</div>" +
        "<div class=\"big-line\">" + py("全部答完啦") + "</div>" +
        "<p class=\"soft\" style=\"margin-bottom:0\">" + py("你真是爱动脑的小朋友") + "</p></div>";
      $("#g3finish").style.display = "inline-block";
      if(!State.g3done){
        State.g3done = true; award();
        FX.burst(window.innerWidth/2, window.innerHeight*0.5, 26, {lift:5.6, speed:7});
        FX.rain(40);
        Stars.add(2);
        Sound.speak("全部答完啦。你拿到了安全小卫士勋章。你真是爱动脑的小朋友。");
      }
      return;
    }
    var q = QS[i];
    answered = false;
    box.innerHTML = "<div style=\"font-weight:900;font-size:1.1rem\">" +
      "<span style=\"color:#9B7BF0\">" + (i+1) + ".</span> " + py(q.q) + "</div>" +
      "<div class=\"qopts\">" + q.opts.map(function(o, k){
        return "<button class=\"qopt\" data-k=\"" + k + "\">" + py(o.t) + "</button>";
      }).join("") + "</div>";
    $("#g3finish").style.display = "none";
  }

  function answer(btn, k){
    if(answered) return;
    var q = QS[i];
    var o = q.opts[k];
    if(o.ok){
      answered = true;
      btn.classList.add("right");
      FX.burst(window.innerWidth/2, window.innerHeight*0.52, 10);
      toast("答对啦，得到星星");
      Stars.add(1);
      Sound.speak("答对啦。" + q.tip);
      setTimeout(function(){ i++; answered = false; render(); }, 1150);
    } else {
      btn.classList.add("wrong");
      Sound.speak("再想一想哦。" + q.tip);
      toast("再想一想哦");
      setTimeout(function(){ btn.classList.remove("wrong"); }, 900);
    }
  }

  function init(){
    render();
    $("#g3box").addEventListener("click", function(e){
      var b = e.target.closest(".qopt");
      if(!b) return;
      answer(b, +b.dataset.k);
    });
    $("#g3finish").addEventListener("click", function(){
      var el = document.getElementById("p8");
      if(el) el.scrollIntoView({behavior:"smooth"});
      setTimeout(function(){
        FX.burst(window.innerWidth/2, window.innerHeight*0.4, 30, {lift:6, speed:7.5});
        FX.rain(50);
        Sound.speak("你真棒，全部通关啦。记得把今天学的，讲给爸爸妈妈听。");
      }, 700);
    });
  }

  function reset(){ i = 0; answered = false; State.g3done = false; render(); }
  return {init:init, reset:reset};
})();

/* =========================================================
   语音绑定 / 进度 / 导航
   ========================================================= */
function bindSpeech(){
  document.addEventListener("click", function(e){
    var el = e.target.closest("[data-say]");
    if(el){ Sound.speak(el.getAttribute("data-say")); return; }
    var p = e.target.closest("p, .big-line, .h2, .h1, .title-big");
    if(p){
      var t = plain(p.innerHTML);
      if(t && t.length > 1) Sound.speak(t);
    }
  });
}

function bindReward(){
  document.addEventListener("pointerdown", function(e){
    if(e.target.closest("#hud")) return;
    FX.ripple(e.clientX, e.clientY, "#FFD75E");
    FX.burst(e.clientX, e.clientY, 4, {lift:2.2, speed:3.2});
    var b = e.target.closest(".btn, .chip, .qopt, .tile");
    if(b){
      var r = b.getBoundingClientRect();
      b.style.setProperty("--px", ((e.clientX-r.left)/r.width*100).toFixed(1)+"%");
      b.style.setProperty("--py", ((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
    }
  });
}

function bindProgress(){
  var stage = $("#stage");
  var pages = $$(".page");
  var last = "";
  function upd(){
    var top = stage.scrollTop;
    var h = stage.clientHeight || 1;
    var p = Math.min(1, top / ((pages.length - 1) * h));
    $("#barfill").style.width = (p * 100).toFixed(1) + "%";
  }
  stage.addEventListener("scroll", upd, {passive:true});
  upd();

  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting && en.intersectionRatio > 0.55){
          var t = en.target.querySelector(".h1, .title-big, .h2");
          if(t){
            var txt = plain(t.innerHTML);
            if(txt && txt !== last){
              last = txt;
              setTimeout(function(){ Sound.speak(txt); }, 340);
            }
          }
        }
      });
    }, {root: stage, threshold:[0.55]});
    pages.forEach(function(p){ io.observe(p); });
  }
}

function bindNav(){
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-goto]");
    if(b){
      var el = document.getElementById(b.getAttribute("data-goto"));
      if(el) el.scrollIntoView({behavior:"smooth"});
    }
  });
  var sb = $("#startBtn");
  if(sb) sb.addEventListener("click", function(){
    Sound.speak("我们出发啦。先来看看，AI到底是什么呢？");
    FX.burst(window.innerWidth/2, window.innerHeight*0.6, 18, {lift:4.5});
    setTimeout(function(){
      var el = document.getElementById("p1");
      if(el) el.scrollIntoView({behavior:"smooth"});
    }, 520);
  });
  var ab = $("#againBtn");
  if(ab) ab.addEventListener("click", function(){
    G1.reset(); G2.reset(); G3.reset();
    var el = document.getElementById("p0");
    if(el) el.scrollIntoView({behavior:"smooth"});
  });
}

function boot(){
  buildPages();
  FX.init();               /* Canvas 粒子引擎 */
  Mascot.init();           /* 角色活体动画 */
  Scenery.init();          /* 场景氛围层 */
  renderMedals($("#g3medals"), {});
  renderMedals($("#p8medals"), {});
  G1.init(); G2.init(); G3.init();
  bindSpeech(); bindReward(); bindProgress(); bindNav();

  var sbtn = $("#soundBtn");
  sbtn.addEventListener("click", function(){
    var on = Sound.toggle();
    sbtn.textContent = on ? "🔊" : "🔇";
    toast(on ? "语音打开啦" : "语音关掉啦");
  });

  document.addEventListener("touchstart", function once(){
    document.removeEventListener("touchstart", once);
    setTimeout(function(){ Sound.speak("你好呀，我是AI小机器人，点我一起玩吧。"); }, 420);
  }, {once:true});
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

