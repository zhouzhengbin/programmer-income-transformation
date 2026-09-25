/* 语文4：儿歌跟唱（真实演唱 + 伴奏） */
const G_Song = (()=>{
  let player = null;
  let timeTimer = null;
  let curHost = null;

  function stop(){
    if(timeTimer){ clearInterval(timeTimer); timeTimer = null; }
    if(player){ try{ player.pause(); }catch(e){} player.onended=null; player=null; }
    if(curHost){
      curHost.querySelectorAll(".song-line").forEach(b=>b.classList.remove("playing"));
    }
  }

  function render(host, api){
    stop();
    curHost = host;
    const song = Kit.pick(DATA.chinese.songs);
    const src = encodeURI("/ertongleyuan/assets/songs/" + song.title + ".mp3");
    let heard = 0;
    host.innerHTML = `
      <div class="hint-bar">点歌词听老师唱，跟着一起唱吧 🎵</div>
      <div class="song-card">
        <div class="song-head"><span class="song-emoji">${song.emoji}</span>
          <span class="song-title" id="sgTitle" role="button" tabindex="0">${song.title} 🔊</span></div>
        <div class="song-lines" id="songLines"></div>
        <div class="poem-actions">
          <button class="chip" id="sgPlay">🎵 唱一遍</button>
          <button class="chip" id="sgStop">⏸️ 停止</button>
          <button class="chip" id="sgNext">换一首</button>
        </div>
        <div class="progress-wrap" style="margin-top:14px"><div class="progress-bar" id="sgBar"></div></div>
      </div>`;
    const box = Kit.$("#songLines",host);
    const lineBtns = [];

    function markPlaying(idx){
      lineBtns.forEach((b,i)=>b.classList.toggle("playing", i===idx));
    }

    function playAll(){
      stop();
      player = new Audio(src);
      player.preload = "auto";
      player.volume = AudioKit.isMuted() ? 0 : 1;
      const p = player.play();
      if(p && p.catch) p.catch(()=>{});
      const per = 1 / song.lines.length;
      timeTimer = setInterval(()=>{
        if(!player || !player.duration) return;
        const i2 = Math.min(song.lines.length-1, Math.floor((player.currentTime / player.duration) * song.lines.length));
        markPlaying(i2);
        Kit.setBar("sgBar", (player.currentTime/player.duration)*100);
      }, 120);
      player.onended = ()=>{ markPlaying(-1); Kit.setBar("sgBar",100); };
    }

    song.lines.forEach((line,i)=>{
      const b = Kit.el("button","song-line");
      b.type="button";
      b.innerHTML = "<span class=\"poem-idx\">🎵</span><span class=\"poem-text\">"+line+"</span>";
      b.onclick = ()=>{
        if(!b.classList.contains("read")){
          b.classList.add("read"); heard++;
          AudioKit.star(); api.addStars(1);
          if(heard===song.lines.length) api.finish("儿歌全听完啦！");
        }
        playAll();
      };
      lineBtns.push(b);
      box.appendChild(b);
    });

    Kit.$("#sgPlay",host).onclick = ()=>{ AudioKit.click(); playAll(); };
    Kit.$("#sgStop",host).onclick = ()=>{ AudioKit.click(); stop(); };
    Kit.$("#sgNext",host).onclick = ()=>{ AudioKit.click(); stop(); render(host, api); };

    // 标题朗读
    const titleEl = Kit.$("#sgTitle", host);
    const readTitle = ()=>AudioKit.speak("儿歌 " + song.title, "zh-CN", 0.78, 1.12);
    if(titleEl){
      titleEl.onclick = ()=>{ AudioKit.click(); readTitle(); };
      titleEl.onkeydown = (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); readTitle(); } };
    }

    // 进入后先报歌名，再自动唱一遍
    setTimeout(()=>{ if(curHost===host) readTitle(); }, 260);
    setTimeout(()=>{ if(curHost===host) playAll(); }, 1600);
  }

  return { render, title:"儿歌跟唱", icon:"🎵", hint:"听真正的儿歌演唱" };
})();
