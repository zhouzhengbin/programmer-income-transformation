/* ============================================================
   交互引擎 —— 支撑十几种玩法
   拖拽 / 点击 / 涂色 / 连线 / 点泡泡 / 翻牌 / 拼图 / 排序
   ============================================================ */
const Kit = (() => {

  /* ---------- 工具 ---------- */
  const $  = (s,r=document)=> r.querySelector(s);
  const $$ = (s,r=document)=> [...r.querySelectorAll(s)];
  const el = (tag, cls, html)=>{
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  };
  const shuffle = a => a.slice().sort(()=>Math.random()-0.5);
  const rand = (a,b)=> a + Math.floor(Math.random()*(b-a+1));
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  /* ---------- 拖拽 ---------- */
  function makeDraggable(node, opts){
    node.classList.add('draggable');
    let ghost = null, active = false, curZone = null;
    const zoneSel = opts.zoneSelector || '.dropzone';

    function zones(){ return $$(zoneSel).filter(z=>!z.classList.contains('filled')); }

    function hit(x,y){
      let found = null;
      for(const z of zones()){
        const r = z.getBoundingClientRect();
        if(x>=r.left && x<=r.right && y>=r.top && y<=r.bottom) found = z;
      }
      return found;
    }

    function down(e){
      if(node.classList.contains('locked')) return;
      active = true;
      const r = node.getBoundingClientRect();
      ghost = node.cloneNode(true);
      ghost.style.cssText += 'position:fixed;left:'+r.left+'px;top:'+r.top+'px;'+
        'width:'+r.width+'px;height:'+r.height+'px;pointer-events:none;z-index:400;'+
        'opacity:.9;transform:scale(1.1) rotate(3deg);transition:none;margin:0;';
      document.body.appendChild(ghost);
      node.classList.add('dragging');
      if(opts.onPick) opts.onPick(node);
      document.addEventListener('pointermove', move, {passive:false});
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    }
    function move(e){
      if(!active || !ghost) return;
      e.preventDefault();
      const r = node.getBoundingClientRect();
      ghost.style.left = (e.clientX - r.width/2)+'px';
      ghost.style.top  = (e.clientY - r.height/2)+'px';
      const z = hit(e.clientX, e.clientY);
      if(z !== curZone){
        if(curZone) curZone.classList.remove('over');
        curZone = z;
        if(curZone) curZone.classList.add('over');
      }
    }
    function up(e){
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', up);
      if(!active) return;
      active = false;
      const z = hit(e.clientX, e.clientY);
      if(ghost){ ghost.remove(); ghost = null; }
      node.classList.remove('dragging');
      if(curZone){ curZone.classList.remove('over'); curZone = null; }
      if(z && opts.onDrop) opts.onDrop(node, z);
      else if(opts.onCancel) opts.onCancel(node);
    }
    node.addEventListener('pointerdown', down);
    return node;
  }

  /* ---------- 涂色 ---------- */
  // 用 Canvas 洪水填充实现区域填色
  function makeColoring(canvas, regions, palette, onFill){
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    const W = canvas.width, H = canvas.height;
    let current = palette[0];
    let lastFill = 0;

    function drawGuide(){
      ctx.clearRect(0,0,W,H);
      regions.forEach((rg, i)=>{
        ctx.beginPath();
        if(rg.type === 'circle'){
          ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI*2);
        }else{
          rg.pts.forEach((p, k)=> k ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
          ctx.closePath();
        }
        ctx.fillStyle = rg.filled || '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#3d5480';
        ctx.lineWidth = 3;
        ctx.stroke();
        // 区域编号，方便小朋友认
        if(rg.label){
          ctx.fillStyle = '#9aa9c4';
          ctx.font = '600 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(rg.label, rg.lx || rg.x, rg.ly || (rg.y + 4));
        }
      });
    }

    function hitRegion(x,y){
      for(let i=regions.length-1;i>=0;i--){
        const rg = regions[i];
        ctx.save();
        ctx.beginPath();
        if(rg.type === 'circle') ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI*2);
        else{
          rg.pts.forEach((p,k)=> k ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
          ctx.closePath();
        }
        const inside = ctx.isPointInPath(x,y);
        ctx.restore();
        if(inside) return rg;
      }
      return null;
    }

    function fillAt(clientX, clientY){
      const r = canvas.getBoundingClientRect();
      const x = (clientX - r.left) * (W / r.width);
      const y = (clientY - r.top) * (H / r.height);
      const rg = hitRegion(x,y);
      if(!rg) return false;
      if(rg.filled === current) return false;
      rg.filled = current;
      AudioKit.paint();
      drawGuide();
      const done = regions.every(g=>g.filled);
      if(done && onFill) onFill(true);
      else if(onFill) onFill(false);
      return true;
    }

    function setColor(c){ current = c; }
    function reset(){
      regions.forEach(r=>{ r.filled = null; });
      drawGuide();
    }
    function progress(){
      const n = regions.filter(r=>r.filled).length;
      return Math.round(n / regions.length * 100);
    }

    canvas.addEventListener('pointerdown', e=>{
      e.preventDefault();
      fillAt(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointermove', e=>{
      if(e.buttons === 1) fillAt(e.clientX, e.clientY);
    });

    drawGuide();
    return { setColor, reset, progress, drawGuide };
  }

  /* ---------- 连线 ---------- */
  // 左右两列点击配对，中间画 SVG 曲线
  function makeLines(container, leftItems, rightItems, onMatch){
    const wrap = el('div','line-wrap');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','line-svg');
    const colL = el('div','line-col col-left'), colR = el('div','line-col col-right');
    colL.dataset.side = 'L'; colR.dataset.side = 'R';
    wrap.append(colL, colR);
    container.appendChild(wrap);
    wrap.appendChild(svg);

    let selL = null, matched = 0;
    const lines = [];

    function mkNode(item, side){
      const n = el('button','line-node');
      n.type = 'button';
      n.innerHTML = item.html;
      n.dataset.key = item.key;
      n.dataset.side = side;
      n.onclick = ()=>{
        if(n.classList.contains('done')) return;
        if(side === 'L'){
          if(selL) selL.classList.remove('sel');
          selL = n; n.classList.add('sel');
          AudioKit.click();
          if(item.speak) item.speak();
        }else{
          if(!selL) return;
          if(selL.dataset.key === n.dataset.key){
            // 配对成功
            selL.classList.remove('sel');
            selL.classList.add('done'); n.classList.add('done');
            AudioKit.correct();
            drawLine(selL, n);
            matched++;
            if(onMatch) onMatch(matched, leftItems.length);
            selL = null;
          }else{
            n.classList.add('bad');
            setTimeout(()=>n.classList.remove('bad'), 450);
            AudioKit.wrong();
          }
        }
      };
      return n;
    }

    function drawLine(a, b){
      const wr = wrap.getBoundingClientRect();
      const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      const x1 = ar.right - wr.left, y1 = ar.top + ar.height/2 - wr.top;
      const x2 = br.left - wr.left,  y2 = br.top + br.height/2 - wr.top;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      const mx = (x1+x2)/2;
      path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      path.setAttribute('stroke','#4ecb71');
      path.setAttribute('stroke-width','6');
      path.setAttribute('fill','none');
      path.setAttribute('stroke-linecap','round');
      path.setAttribute('opacity','0.9');
      svg.appendChild(path);
      lines.push(path);
    }

    shuffle(leftItems).forEach(it=> colL.appendChild(mkNode(it,'L')));
    shuffle(rightItems).forEach(it=> colR.appendChild(mkNode(it,'R')));

    function reset(){
      lines.forEach(l=>l.remove()); lines.length = 0;
      matched = 0; selL = null;
      $$('.line-node', wrap).forEach(n=> n.classList.remove('done','sel','bad'));
    }
    return { reset, get matched(){ return matched; } };
  }

  /* ---------- 点泡泡 ---------- */
  function makeBubbles(container, opts){
    // opts: { items:[{label, ok}], onHit(ok), duration }
    let score = 0, timeLeft = opts.duration || 30, timer = null, stopped = false;
    const field = el('div','bubble-field');
    container.appendChild(field);
    const hud = el('div','bubble-hud');
    hud.innerHTML = `<span>⏱ <b id="bubTime">${timeLeft}</b> 秒</span>
                     <span>✅ <b id="bubScore">0</b></span>`;
    container.appendChild(hud);

    function spawn(){
      if(stopped) return;
      const it = pick(opts.items);
      const b = el('button','bubble');
      b.type = 'button';
      b.textContent = it.label;
      b.dataset.ok = it.ok ? '1' : '0';
      const size = 62 + Math.random()*30;
      b.style.width = b.style.height = size+'px';
      b.style.left = (5 + Math.random()*80)+'%';
      b.style.bottom = '-100px';
      b.style.setProperty('--dur', (3.4 + Math.random()*2.4)+'s');
      b.style.setProperty('--hue', rand(0,360));
      b.onclick = ()=>{
        if(stopped || b.dataset.popped) return;
        b.dataset.popped = '1';
        const ok = b.dataset.ok === '1';
        b.classList.add(ok ? 'pop-ok' : 'pop-no');
        AudioKit.pop();
        if(ok){
          score++;
          $('#bubScore', hud).textContent = score;
          AudioKit.correct();
          if(opts.onHit) opts.onHit(true);
        }else{
          AudioKit.wrong();
          if(opts.onHit) opts.onHit(false);
        }
        setTimeout(()=>b.remove(), 320);
      };
      field.appendChild(b);
      setTimeout(()=>{ if(!b.dataset.popped) b.remove(); }, 6200);
    }

    const iv = setInterval(spawn, 750);
    timer = setInterval(()=>{
      timeLeft--;
      const t = $('#bubTime', hud);
      if(t) t.textContent = timeLeft;
      if(timeLeft <= 0) stop();
    }, 1000);

    function stop(){
      if(stopped) return;
      stopped = true;
      clearInterval(iv); clearInterval(timer);
      if(opts.onEnd) opts.onEnd(score);
    }
    return { stop, get score(){ return score; } };
  }

  /* ---------- 记忆翻牌 ---------- */
  function makeMemory(container, pairs, onDone){
    const grid = el('div','mem-grid');
    container.appendChild(grid);
    // 每对两张
    const cards = [];
    pairs.forEach((p,i)=>{
      cards.push({ id:i, face:p.face, back:p.back || '❓' });
      cards.push({ id:i, face:p.face, back:p.back || '❓' });
    });
    const deck = shuffle(cards);
    let open = [], lock = false, found = 0;

    deck.forEach(c=>{
      const card = el('button','mem-card');
      card.type = 'button';
      card.innerHTML = `<span class="mem-inner">
        <span class="mem-front">${c.back}</span>
        <span class="mem-back">${c.face}</span>
      </span>`;
      card.dataset.id = c.id;
      card.onclick = ()=>{
        if(lock || card.classList.contains('flip') || card.classList.contains('done')) return;
        card.classList.add('flip');
        AudioKit.click();
        if(c.face && /[\u4e00-\u9fa5a-zA-Z]/.test(c.face) && c.face.length <= 2){
          AudioKit.speak(c.face, /[a-zA-Z]/.test(c.face) ? 'en-US' : 'zh-CN', 0.8);
        }
        open.push(card);
        if(open.length === 2){
          lock = true;
          const [a,b] = open;
          if(a.dataset.id === b.dataset.id){
            setTimeout(()=>{
              a.classList.add('done'); b.classList.add('done');
              AudioKit.correct();
              found++;
              open = []; lock = false;
              if(found === pairs.length && onDone) onDone();
            }, 420);
          }else{
            setTimeout(()=>{
              a.classList.remove('flip'); b.classList.remove('flip');
              AudioKit.wrong();
              open = []; lock = false;
            }, 820);
          }
        }
      };
      grid.appendChild(card);
    });
    return { pairs: pairs.length };
  }

  /* ---------- 拼图 ---------- */
  function makePuzzle(container, emoji, gridN, onDone){
    // 真实图片切片：用 canvas 画一张完整场景，再按格切成独立碎片
    const SIZE = 360;
    const scene = document.createElement("canvas");
    scene.width = SIZE; scene.height = SIZE;
    const sc = scene.getContext("2d");
    // 背景：柔和渐变天空 + 草地，配色温和护眼
    const g = sc.createLinearGradient(0,0,0,SIZE);
    g.addColorStop(0,"#bfe9ff");
    g.addColorStop(.62,"#dff6ff");
    g.addColorStop(.63,"#c8f0d0");
    g.addColorStop(1,"#a9e6bb");
    sc.fillStyle = g; sc.fillRect(0,0,SIZE,SIZE);
    // 太阳/云/花等装饰，让画面每块都不一样，拼起来有整体感
    sc.fillStyle = "#ffe27a";
    sc.beginPath(); sc.arc(SIZE*0.80, SIZE*0.20, SIZE*0.10, 0, Math.PI*2); sc.fill();
    sc.fillStyle = "#ffffff";
    [[0.22,0.18,0.085],[0.34,0.24,0.062]].forEach(function(c){
      sc.beginPath(); sc.arc(SIZE*c[0], SIZE*c[1], SIZE*c[2], 0, Math.PI*2); sc.fill();
    });
    // 主体 emoji 居中放大
    sc.font = Math.round(SIZE*0.44)+"px serif";
    sc.textAlign="center"; sc.textBaseline="middle";
    sc.fillText(emoji, SIZE/2, SIZE*0.56);
    // 底部小花点缀
    for(var t=0;t<6;t++){
      sc.fillStyle = ["#ffb3c7","#ffd6a5","#c9b6ff","#ffffff"][t%4];
      sc.beginPath(); sc.arc(SIZE*(0.08+t*0.16), SIZE*(0.86+((t%2)*0.05)), SIZE*0.028, 0, Math.PI*2); sc.fill();
    }

    const board = el("div","puz-board");
    board.style.gridTemplateColumns = "repeat(" + gridN + ",1fr)";
    const tray = el("div","puz-tray");
    container.append(board, tray);

    const total = gridN*gridN;
    const cw = SIZE/gridN, ch = SIZE/gridN;
    const cells = [];
    for(let i=0;i<total;i++){
      const c = el("div","puz-cell dropzone");
      c.dataset.idx = i;
      board.appendChild(c);
      cells.push(c);
    }
    function pieceCanvas(i){
      const cv = document.createElement("canvas");
      cv.width = cw; cv.height = ch;
      const cx = cv.getContext("2d");
      const col = i % gridN, row = Math.floor(i/gridN);
      cx.drawImage(scene, col*cw, row*ch, cw, ch, 0, 0, cw, ch);
      return cv;
    }
    let placed = 0;
    shuffle([...Array(total).keys()]).forEach(i=>{
      const piece = el("div","puz-piece");
      piece.dataset.idx = i;
      piece.style.backgroundImage = "none";
      piece.style.background = "#fff";
      piece.appendChild(pieceCanvas(i));
      tray.appendChild(piece);
      makeDraggable(piece, {
        zoneSelector: ".puz-cell",
        onPick: ()=>AudioKit.pick(),
        onDrop: (p, z)=>{
          if(z.classList.contains("filled")) return;
          if(p.dataset.idx === z.dataset.idx){
            z.appendChild(p);
            p.style.position = "static";
            p.style.width = "100%";
            p.style.height = "100%";
            p.style.border = "none";
            p.style.boxShadow = "none";
            z.classList.add("filled");
            AudioKit.correct();
            placed++;
            if(placed === total && onDone) onDone();
          }else{
            AudioKit.wrong();
            z.classList.add("wrong");
            setTimeout(()=>z.classList.remove("wrong"), 420);
          }
        }
      });
    });
  }

  function makeSort(container, items, correctOrder, onDone){
    // items: [{key, html}]，correctOrder: ['key1','key2',...] 从小到大
    const row = el('div','sort-row');
    container.appendChild(row);
    const slots = el('div','sort-slots');
    container.appendChild(slots);

    correctOrder.forEach((_,i)=>{
      const s = el('div','sort-slot dropzone');
      s.dataset.pos = i;
      s.innerHTML = `<span class="sort-num">${i+1}</span>`;
      slots.appendChild(s);
    });

    items.forEach(it=>{
      const n = el('div','sort-item');
      n.innerHTML = it.html;
      n.dataset.key = it.key;
      row.appendChild(n);
      makeDraggable(n, {
        zoneSelector: '.sort-slot',
        onPick: ()=>AudioKit.pick(),
        onDrop: (node, z)=>{
          if(z.classList.contains('filled')) return;
          const pos = Number(z.dataset.pos);
          if(correctOrder[pos] === node.dataset.key){
            z.classList.add('filled','correct');
            z.innerHTML = `<span class="sort-num">${pos+1}</span>` + node.innerHTML;
            node.remove();
            AudioKit.correct();
            if($$('.sort-slot.filled', slots).length === correctOrder.length && onDone) onDone();
          }else{
            z.classList.add('wrong');
            setTimeout(()=>z.classList.remove('wrong'), 420);
            AudioKit.wrong();
          }
        }
      });
    });
    return {};
  }

  /* ---------- 提示与庆祝 ---------- */
  let toastTimer = null;
  function toast(msg, kind='good'){
    const t = $('#toast');
    if(!t) return;
    t.textContent = msg;
    t.className = 'toast show ' + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove('show'), 2300);
  }

  function confetti(n=70){
    const colors = ['#ff6b8b','#ffd93d','#4ecb71','#4aa8ff','#a06bff','#33d9c1','#ffa552','#ff8fd0'];
    for(let i=0;i<n;i++){
      const c = el('div','confetti');
      c.style.left = Math.random()*100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animation = `fall ${1.5 + Math.random()*1.7}s linear ${Math.random()*0.4}s forwards`;
      if(Math.random() > .6) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(()=>c.remove(), 4200);
    }
  }

  /* ---------- 进度条 ---------- */
  function setBar(id, pct){
    const b = document.getElementById(id);
    if(b) b.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }

  return { $, $$, el, shuffle, rand, pick,
           makeDraggable, makeColoring, makeLines, makeBubbles,
           makeMemory, makePuzzle, makeSort,
           toast, confetti, setBar };
})();
