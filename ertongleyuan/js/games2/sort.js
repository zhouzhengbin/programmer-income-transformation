/* 综合3：排排队（数字排序） */
const G_Sort = (()=>{
  function render(host, api){
    host.innerHTML = `<div class="hint-bar">把数字从小到大排好队 📊</div>
      <div class="hint-bar" style="background:#fff8e1">先拖最小的，再拖第二小…</div>
      <div id="sortBox"></div>`;
    let round = 0;
    function newRound(){
      if(round >= 3){ api.finish('排序全对啦！'); return; }
      Kit.$('#sortBox',host).innerHTML = '';
      const nums = Kit.shuffle([1,2,3,4,5]).slice(0,4);
      const sorted = nums.slice().sort((a,b)=>a-b);
      const items = nums.map(v=>({
        key:String(v),
        html:'<span class="sort-val">'+v+'</span>'
      }));
      Kit.makeSort(Kit.$('#sortBox',host), items, sorted.map(String), ()=>{
        round++;
        api.addStars(2); api.progress();
        AudioKit.star();
        setTimeout(newRound, 900);
      });
    }
    newRound();
  }
  return { render, title:'排排队', icon:'📊', hint:'数字从小到大排队' };
})();