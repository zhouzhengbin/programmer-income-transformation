/* 一键校验：语法 + 注册表 + 体积 */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const base = __dirname;
console.log('BASE =', base);

function walk(dir, out) {
  for (const n of fs.readdirSync(dir)) {
    if (n === '.omni' || n === 'runtime' || n === 'node_modules') continue;
    const p = path.join(dir, n);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (n.endsWith('.js')) out.push(p);
  }
  return out;
}

const jsFiles = walk(base, []);
console.log('JS_COUNT =', jsFiles.length);

const bad = [];
for (const j of jsFiles) {
  const r = cp.spawnSync('node', ['--check', j], { encoding: 'utf8' });
  if (r.status !== 0) bad.push([path.relative(base, j), (r.stderr || r.stdout || '').slice(0, 200)]);
}
console.log('SYNTAX_ERRORS =', bad.length ? bad : 'NONE');

const eng = fs.readFileSync(path.join(base, 'js', 'core', 'engine.js'), 'utf8');
const ids = [...eng.matchAll(/id:\s*'([a-z]+)'/g)].map(m => m[1]);
const srcs = [...eng.matchAll(/src:\s*'([^']+)'/g)].map(m => m[1]);
console.log('GAMES_REGISTERED =', ids.length, ids);

const missing = srcs.filter(s => !fs.existsSync(path.join(base, s.replace(/\//g, path.sep))));
console.log('GAME_SRC_MISSING =', missing.length ? missing : 'NONE');

let over = [];
for (const j of jsFiles.slice().sort()) {
  const txt = fs.readFileSync(j, 'utf8');
  const sz = Buffer.byteLength(txt, 'utf8');
  const ln = txt.split('\n').length;
  const flag = (sz > 60 * 1024 || ln > 800) ? '  OVER' : '';
  if (flag) over.push(path.relative(base, j));
  console.log(path.relative(base, j).padEnd(50), String(sz).padStart(6), 'B', String(ln).padStart(4), 'lines' + flag);
}
console.log('OVER_LIMIT =', over.length ? over : 'NONE');
