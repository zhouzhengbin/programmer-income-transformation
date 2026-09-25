/* 常识2：好习惯（健康领域） */
const G_Habit = (()=>{
  function render(host, api){
    const list = Kit.shuffle(DATA.common.habits);
    let right = 0, done = 0;
    host.innerHTML = `
      <div class="hint-bar">哪些是好习惯？觉得好就点「👍」，不好点「👎」</div>
      <div class="habit-stage" id="hbStage"></div>
      <div class="progress-wrap" style="margin-top:20px"><div class="progress-bar" id="hbBar"></div></div>`;
    const stage = Kit.$('#hbStage',host);
    let idx = 0;
    function load(){
      if(idx >= list.length){
        api.finish('好习惯全部分清啦！');
        return;
      }
      stage.innerHTML = '';
      const h = list[idx];
      const card = Kit.el('div','habit-card');
      card.innerHTML = `<span class="habit-icon">${h.icon}</span>
        <span class="habit-text">${h.text}</span>`;
      stage.appendChild(card);
      const btns = Kit.el('div','habit-btns');
      [['👍 好习惯', true], ['👎 不可以', false]].forEach(([label, val])=>{
        const b = Kit.el('button','habit-btn', label);
        b.type='button';
        b.onclick = ()=>{
          if(b.dataset.done) return;
          if(val === h.good){
            b.dataset.done = '1';
            b.classList.add('ok');
            AudioKit.correct(); AudioKit.star();
            AudioKit.speak(h.text,'zh-CN',0.8);
            api.addStars(1); right++;
            Kit.setBar('hbBar', (idx+1)/list.length*100);
            setTimeout(()=>{ idx++; load(); }, 900);
          }else{
            b.classList.add('no');
            setTimeout(()=>b.classList.remove('no'), 450);
            AudioKit.wrong();
          }
        };
        btns.appendChild(b);
      });
      stage.appendChild(btns);
      AudioKit.speak(h.text,'zh-CN',0.85);
    }
    load();
  }
  return { render, title:'好习惯', icon:'🪥', hint:'分辨好习惯和坏习惯' };
})();