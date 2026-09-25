/* 综合2：拼图 */
const G_Puzzle = (()=>{
  const PICS = ['🐻','🌈','🚀','🐳','🦁','🍄','🏰','🎪'];
  function render(host, api){
    const emoji = Kit.pick(PICS);
    let n = 3;
    host.innerHTML = `
      <div class="hint-bar">把碎片拖到正确的格子里 🧩</div>
      <div class="game-switch">
        <button class="chip active" data-n="3">3 × 3</button>
        <button class="chip" data-n="4">4 × 4</button>
      </div>
      <div id="puzBox"></div>`;
    function build(){
      Kit.$('#puzBox',host).innerHTML = '';
      Kit.makePuzzle(Kit.$('#puzBox',host), emoji, n, ()=>{
        api.addStars(n*n);
        api.finish('拼好啦，真棒！');
      });
    }
    host.querySelectorAll('[data-n]').forEach(b=>{
      b.onclick = ()=>{
        host.querySelectorAll('[data-n]').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        n = Number(b.dataset.n);
        build(); AudioKit.click();
      };
    });
    build();
  }
  return { render, title:'拼图乐园', icon:'🧩', hint:'拖动碎片还原图画' };
})();