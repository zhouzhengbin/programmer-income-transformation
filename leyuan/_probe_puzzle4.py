# 用 Python + websocket-client（若可用）或纯 http + 直接读 /json/list + websocket 库做 CDP 断言
# 若第三方库不可用，就退化为只做静态结构 + 页面 HTML 完整性检查
import os, sys, json, time, subprocess, urllib.request

base = os.path.dirname(os.path.abspath(__file__))
print('BASE =', base)

required = [
    'index.html',
    'css/style.css',
    'js/core/layout.js',
    'js/core/engine.js',
    'js/core/rewards.js',
    'js/games/puzzle.js',
]
for f in required:
    p = os.path.join(base, f)
    print('%-28s exists=%s size=%s' % (f, os.path.exists(p), os.path.getsize(p) if os.path.exists(p) else '-'))

gdir = os.path.join(base, 'js', 'games')
if os.path.isdir(gdir):
    names = sorted(n for n in os.listdir(gdir) if n.endswith('.js'))
    print('GAMES_FILES(%d) =' % len(names), ', '.join(names))

pp = os.path.join(base, 'js', 'games', 'puzzle.js')
if os.path.exists(pp):
    src = open(pp, 'rb').read().decode('utf-8', 'ignore')
    print('PUZZLE_LEN =', len(src))
    print('PUZZLE_HAS_solved =', 'solved' in src)
    print('PUZZLE_HAS_pointercancel =', 'pointercancel' in src)
    print('PUZZLE_HAS_pointerdown =', 'pointerdown' in src)
    print('PUZZLE_HAS_difficulty =', 'level' in src)
    import re
    exp = sorted(set(re.findall(r'window\.__[A-Za-z_]+', src)))
    print('PUZZLE_EXPOSE =', exp if exp else 'NONE')
    # 检查是否有对外暴露状态的接口，供 CDP 自检用
    has_hook = ('window.__game' in src) or ('window.__omniPuzzle' in src) or ('window.OMNI_PUZZLE' in src)
    print('PUZZLE_STATE_HOOK =', has_hook)
