/* 英语3：单词卡片（点读机） */
const G_Words = (()=>{
  function render(host, api){
    const groups = [
      { name:'动物', key:'animals', emoji:'🐾' },
      { name:'水果', key:'fruits',  emoji:'🍎' },
      { name:'数字', key:'numbers', emoji:'🔢' },
      { name:'身体', key:'body',    emoji:'👁️' },
      { name:'家人', key:'family',  emoji:'👨‍👩‍👧' },
    ];
    let cur = groups[0], learned = {};
    host.innerHTML = `
      <div class="hint-bar">点单词卡片，听英文发音 🔊</div>
      <div class="game-switch" id="wdTabs"></div>
      <div class="word-grid" id="wdGrid"></div>
      <div class="progress-wrap" style="margin-top:18px"><div class="progress-bar" id="wdBar"></div></div>`;
    const tabs = Kit.$('#wdTabs',host), grid = Kit.$('#wdGrid',host);
    groups.forEach((g,i)=>{
      const b = Kit.el('button','chip' + (i===0?' active':''), g.emoji+' '+g.name);
      b.type='button';
      b.onclick = ()=>{
        cur = g;
        tabs.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        load(); AudioKit.click();
      };
      tabs.appendChild(b);
    });
    function load(){
      grid.innerHTML = '';
      const items = DATA.english[cur.key];
      items.forEach(it=>{
        const card = Kit.el('button','word-card');
        card.type = 'button';
        const en = it.en || it.n;
        const cn = it.cn;
        const pic = it.pic || String(it.n);
        card.innerHTML = `<span class="wc-pic">${pic}</span>
          <span class="wc-en">${en}</span>
          <span class="wc-cn">${cn}</span>`;
        card.onclick = ()=>{
          AudioKit.speak(en,'en-US',0.7);
          AudioKit.click();
          learned[en] = 1;
          card.classList.add('tapped');
          if(!card.dataset.counted){
            card.dataset.counted = '1';
            api.addStars(1);
          }
          Kit.setBar('wdBar', Object.keys(learned).length/40*100);
        };
        grid.appendChild(card);
      });
    }
    load();
  }
  return { render, title:'单词卡片', icon:'🃏', hint:'点卡片听发音' };
})();