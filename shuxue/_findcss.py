# -*- coding: utf-8 -*-
import io, os, re
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
F = os.path.join(D, "index-standalone.html")
c = io.open(F, encoding="utf-8").read()
print("原文件长度:", len(c))

# 1. 找到 .game-title 规则
m = re.search(r"\.game-title\s*\{[^}]*\}", c)
if m:
    print("\n=== 当前 .game-title 规则 ===")
    print(m.group(0))

# 2. 找到所有 background-clip:text 用法
print("\n=== background-clip: text 出现次数:", len(re.findall(r"background-clip\s*:\s*text", c)))
for mm in re.finditer(r"([^{}]{0,80})\{([^{}]*background-clip\s*:\s*text[^{}]*)\}", c):
    print("  选择器:", mm.group(1).strip()[:70])
    print("    规则:", mm.group(2).strip()[:160])

# 3. 统计 -webkit-text-fill-color
print("\n=== -webkit-text-fill-color 出现次数:", len(re.findall(r"-webkit-text-fill-color", c)))
