/* 英语5：记忆翻牌 */
const G_Memory = (()=>{
  function render(host, api){
    const items = Kit.shuffle(DATA.english.animals).slice(0,6);
    host.innerHTML = `
      <div class="hint-bar">翻牌找出一样的卡片 🃏</div>
      <div id="memBox"></div>
      <div class="progress-wrap" style="margin-top:18px"><div class="progress-bar" id="memBar"></div></div>`;
    const pairs = items.map(it=>({ face:it.pic, key:it.en, cn:it.cn }));
    let found = 0;
    Kit.makeMemory(Kit.$('#memBox',host), pairs, ()=>{
      api.addStars(5); api.progress();
      api.finish('全部配对成功，记忆力真好！');
    });
    // 点击时朗读
    Kit.$('#memBox',host).addEventListener('click', e=>{
      const card = e.target.closest('.mem-card');
      if(!card || !card.classList.contains('flip')) return;
      const face = card.querySelector('.mem-back');
      if(!face) return;
      const it = items.find(x=>x.pic === face.textContent.trim());
      if(it) AudioKit.speak(it.en,'en-US',0.72);
    });
  }
  return { render, title:'记忆翻牌', icon:'🃏', hint:'翻出成对的卡片' };
})();