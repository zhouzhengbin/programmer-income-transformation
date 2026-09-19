# -*- coding: utf-8 -*-
import io, os, re, shutil
D = r"C:\Users\86139\Documents\ChatGPT\小二算数"

for FN in ["index-standalone.html", "css\\style.css"]:
    F = os.path.join(D, FN)
    if not os.path.exists(F):
        print("跳过(不存在):", FN); continue
    shutil.copy2(F, F + ".bak")
    c = io.open(F, encoding="utf-8").read()
    orig = len(c)

    # 修复 1: .game-title 加 fallback 不透明色（在 color:transparent 之前加兜底）
    old_title = ".game-title{font-size:clamp(44px,11vw,76px);font-weight:900;letter-spacing:8px;"
    new_title = ".game-title{font-size:clamp(44px,11vw,76px);font-weight:900;letter-spacing:8px;color:#FF7A45;"
    if old_title in c:
        c = c.replace(old_title, new_title, 1)
        print(FN, "-> .game-title 加了 fallback color:#FF7A45")

    # 修复 2: 给 background-clip:text 加 @supports 保护 —— 把 color:transparent 改成仅在支持时透明
    # 具体：把 "-webkit-background-clip:text;background-clip:text;color:transparent;" 
    # 改成带 @supports 包裹更复杂，这里用最实用方案：保留渐变但确保有兜底色
    c = c.replace(
        "-webkit-background-clip:text;background-clip:text;color:transparent;",
        "-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#FF7A45;",
        1)
    print(FN, "-> 改用 -webkit-text-fill-color:transparent（color 保留兜底色）")

    # 修复 3: body 文字色加深，提升对比度
    c = c.replace("color:rgb(74,155,224)", "color:#2A5C8A")
    c = c.replace("color: #4a9be0", "color:#2A5C8A")
    c = c.replace("color:#4a9be0", "color:#2A5C8A")
    print(FN, "-> body 文字色 -> #2A5C8A")

    if len(c) != orig or c != io.open(F, encoding="utf-8").read():
        io.open(F, "w", encoding="utf-8").write(c)
        print(FN, "-> 已保存，长度", orig, "->", len(c))
    else:
        print(FN, "-> 无变化")
    print()

# 同步到 _deploy
import shutil as sh
src = os.path.join(D, "index-standalone.html")
dst = os.path.join(D, "_deploy", "index.html")
sh.copy2(src, dst)
sh.copy2(src, os.path.join(D, "_deploy", "404.html"))
print("_deploy/index.html + 404.html 已同步")
