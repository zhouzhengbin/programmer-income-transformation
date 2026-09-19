# -*- coding: utf-8 -*-
import io, os, re
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"
c = io.open(os.path.join(D,"index-standalone.html"), encoding="utf-8").read()

print("=== reroll 函数定义 ===")
for m in re.finditer(r"function\s+reroll\s*\([^)]*\)\s*\{", c):
    s = m.start(); depth=0; i=m.end()-1
    while i < len(c):
        if c[i]=="{": depth+=1
        elif c[i]=="}":
            depth-=1
            if depth==0: break
        i+=1
    print(c[s:i+1])
    print("---")

print("\n=== btnNew 绑定 ===")
for m in re.finditer(r"btnNew", c):
    i=m.start()
    seg = c[max(0,i-200):i+300]
    if "addEventListener" in seg or "onclick" in seg:
        print("--- @%d ---" % i); print(seg); print()
