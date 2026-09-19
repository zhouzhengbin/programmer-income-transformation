# -*- coding: utf-8 -*-
import io, os, re
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
c = io.open(os.path.join(D,"js","app.js"), encoding="utf-8").read()

print("=== app.js 中 换一题 相关代码 ===")
idx = c.find("换一题")
while idx != -1:
    print("--- @%d ---" % idx)
    print(c[max(0,idx-400):idx+500])
    print()
    idx = c.find("换一题", idx+1)
    if idx > 60000: break

print("\n=== 查找 reroll/next/newQ 等函数 ===")
for m in re.finditer(r"function\s+(\w+)\s*\(", c):
    nm = m.group(1)
    if re.search(r"next|reroll|refresh|new|swap|change|regen|again", nm, re.I):
        print("  ", nm)

print("\n=== 查找 build 调用与随机 ===")
for m in re.finditer(r"\.build\s*\(", c):
    s = max(0, m.start()-150)
    print("--- @%d ---" % m.start())
    print(c[s:m.start()+250])
    print()
