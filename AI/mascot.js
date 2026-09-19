/* =========================================================
   mascot.js —— 活物机器人 + 场景氛围增强
   ========================================================= */
var Mascot = (function(){
  var eyes = [], pupils = [], wrappers = [], antenna = [];
  var t0 = performance.now();
  var look = {x:0, y:0}, targetLook = {x:0, y:0};
  var excited = 0;

  function init(){
    wrappers = Array.prototype.slice.call(document.querySelectorAll(".mascot svg"));
    eyes = []; pupils = []; antenna = [];

    wrappers.forEach(function(svg){
      /* 为每个机器人补上可动的瞳孔 */
      var cs = svg.querySelectorAll("circle");
      cs.forEach(function(c){
        if(c.getAttribute("r") === "8" && c.classList.contains("eye")){
          var px = parseFloat(c.getAttribute("cx")), py = parseFloat(c.getAttribute("cy"));
          var p = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          p.setAttribute("r", "3.4");
          p.setAttribute("cx", px);
          p.setAttribute("cy", py);
          p.setAttribute("fill", "#2B2118");
          p.setAttribute("opacity", ".9");
          p.dataset.baseX = px; p.dataset.baseY = py;
          c.parentNode.appendChild(p);
          pupils.push(p);
        }
        if(c.tagName === "circle" && c.parentNode && c.parentNode.tagName === "svg" && c.getAttribute("r") === "11"){
          antenna.push(c);
        }
      });
      /* 整只机器人的呼吸容器 */
      svg.style.transformOrigin = "50% 78%";
    });

    /* 眼球跟随触点 */
    document.addEventListener("pointermove", function(e){
      targetLook.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetLook.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, {passive:true});

    /* 点机器人 → 惊喜反应 */
    wrappers.forEach(function(svg){
      var host = svg.closest(".mascot");
      if(!host) return;
      host.style.cursor = "pointer";
      host.addEventListener("click", function(e){
        excited = 1;
        var r = svg.getBoundingClientRect();
        if(window.Stage) Stage.burst(r.left + r.width/2, r.top + r.height/2, 16, {lift:4.4, speed:5});
        if(window.Sound) Sound.speak("嘿嘿，你点到我啦。");
      });
    });

    loop();
  }

  var last = performance.now();
  function loop(){
    var now = performance.now();
    var dt = Math.min(2.5, (now-last)/16.667 || 1); last = now;
    var t = now - t0;

    /* 视线缓动 */
    look.x += (targetLook.x - look.x) * 0.06 * dt;
    look.y += (targetLook.y - look.y) * 0.06 * dt;

    /* 呼吸 */
    var breath = 1 + Math.sin(t*0.0016)*0.018;
    /* 惊喜衰减 */
    if(excited > 0) excited = Math.max(0, excited - 0.016*dt);
    var pop = 1 + excited*0.12;
    var tilt = Math.sin(t*0.0022)*1.4 + excited*Math.sin(t*0.02)*6;

    wrappers.forEach(function(svg){
      svg.style.transform = "scale("+(breath*pop).toFixed(4)+") rotate("+tilt.toFixed(2)+"deg)";
    });

    /* 瞳孔 */
    pupils.forEach(function(p){
      var bx = parseFloat(p.dataset.baseX), by = parseFloat(p.dataset.baseY);
      p.setAttribute("cx", (bx + look.x*2.6).toFixed(2));
      p.setAttribute("cy", (by + look.y*2.2).toFixed(2));
    });

    /* 天线光晕呼吸 */
    antenna.forEach(function(a){
      var r = 11 + Math.sin(t*0.0035)*2.2;
      a.setAttribute("r", r.toFixed(2));
    });

    requestAnimationFrame(loop);
  }

  return { init: init };
})();

/* =========================================================
   场景氛围：每页动态背景层
   ========================================================= */
var Scenery = (function(){

  function buildCloud(cls, top, scale, dur, delay, opacity){
    var d = document.createElement("div");
    d.className = "sc-cloud " + cls;
    d.style.top = top + "px";
    d.style.transform = "scale(" + scale + ")";
    d.style.animationDuration = dur + "s";
    d.style.animationDelay = delay + "s";
    d.style.opacity = opacity;
    return d;
  }

  function decorate(page, cfg){
    if(!page || page.dataset.decorated) return;
    page.dataset.decorated = "1";

    /* 光斑层 */
    var glow = document.createElement("div");
    glow.className = "sc-glow";
    glow.style.background = cfg.glow ||
      "radial-gradient(38% 26% at 22% 18%, rgba(255,225,150,.55), transparent 70%)," +
      "radial-gradient(34% 24% at 80% 30%, rgba(255,180,215,.45), transparent 70%)," +
      "radial-gradient(40% 28% at 55% 88%, rgba(160,220,255,.42), transparent 72%)";
    page.insertBefore(glow, page.firstChild);

    /* 云朵层 */
    var sky = document.createElement("div");
    sky.className = "sc-sky";
    sky.appendChild(buildCloud("s1", cfg.c1 || 60,  1.00, 46, 0,  .78));
    sky.appendChild(buildCloud("s2", cfg.c2 || 150, 0.68, 62, 9,  .62));
    sky.appendChild(buildCloud("s3", cfg.c3 || 240, 0.50, 78, 21, .48));
    page.insertBefore(sky, page.firstChild);

    /* 地面装饰（部分页） */
    if(cfg.ground){
      var g = document.createElement("div");
      g.className = "sc-ground";
      g.innerHTML = cfg.ground;
      page.appendChild(g);
    }
  }

  function init(){
    var pages = document.querySelectorAll(".page");
    var cfgs = [
      {ground: '<span>🌷</span><span>🌿</span><span>🌼</span><span>🍀</span><span>🌻</span><span>🌱</span>'},
      {ground: '<span>☁️</span><span>⭐</span><span>🌙</span><span>✨</span><span>💫</span><span>⭐</span>'},
      {ground: '<span>🎨</span><span>📖</span><span>🎵</span><span>🧮</span><span>🔤</span><span>❓</span>'},
      {ground: '<span>💬</span><span>✨</span><span>🎯</span><span>💡</span><span>🌟</span><span>💬</span>'},
      {ground: '<span>🎮</span><span>⭐</span><span>🎈</span><span>✨</span><span>🏅</span><span>🎉</span>'},
      {ground: '<span>🧩</span><span>🔷</span><span>🔶</span><span>🟣</span><span>🧱</span><span>⚙️</span>'},
      {ground: '<span>🛡️</span><span>🔒</span><span>💚</span><span>🤝</span><span>👀</span><span>🏠</span>'},
      {ground: '<span>❓</span><span>💭</span><span>🏆</span><span>⭐</span><span>🎯</span><span>✨</span>'},
      {ground: '<span>🏆</span><span>🎉</span><span>⭐</span><span>🎊</span><span>🥇</span><span>💖</span>'}
    ];
    pages.forEach(function(p, i){ decorate(p, cfgs[i] || {}); });
  }

  return { init: init };
})();
