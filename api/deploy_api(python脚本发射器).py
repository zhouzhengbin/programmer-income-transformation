import os
import sys
import shutil
import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox

# ==========================================
# 1. 核心配置区
# ==========================================
SITE_URL = "https://zhouzhengbin.site"
DEPLOY_DIR = r"C:\Users\86139\Desktop\MyWebsite_Deploy"
DESKTOP_DIR = r"C:\Users\86139\Desktop"
# Python API 脚本的专属云端目录
API_DEPLOY_DIR = os.path.join(DEPLOY_DIR, "api")

def run_cmd(cmd, cwd=None):
    """静默执行终端 Git 命令"""
    result = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    return result.returncode == 0, result.stderr

def main():
    root = tk.Tk()
    root.withdraw() # 隐藏主窗口

    # --- 步骤 1：选择要发布的 Python 脚本 ---
    py_file_path = filedialog.askopenfilename(
        title="第一步：请选择要发射的 Python 工具脚本 (.py)",
        initialdir=DESKTOP_DIR,
        filetypes=[("Python 脚本", "*.py")]
    )
    if not py_file_path:
        sys.exit(0) # 用户取消则退出

    # --- 步骤 2：询问并选择依赖库配置 (requirements.txt) ---
    req_file_path = None
    if messagebox.askyesno("挂载依赖库", "是否需要同时上传第三方库配置文件？\n\n(如果你需要部署带 Pillow 等第三方库的脚本，请点击'是'选择 requirements.txt)"):
        req_file_path = filedialog.askopenfilename(
            title="第二步：请选择 requirements 文件",
            initialdir=DESKTOP_DIR,
            filetypes=[("文本文件", "*.txt"), ("所有文件", "*.*")]
        )
        
        # 防呆设计：如果用户选了带双后缀的文件，给予温馨提示
        if req_file_path and os.path.basename(req_file_path) != "requirements.txt":
            messagebox.showinfo(
                "智能修复提示", 
                f"系统检测到你选择的文件名为：{os.path.basename(req_file_path)}\n\n"
                "为确保云端 Vercel 能够完美识别，系统将在装填时自动将其重命名为标准的 'requirements.txt'。"
            )

    # 提取脚本名称，用于生成接口 URL 和提交日志
    file_name = os.path.basename(py_file_path)
    api_endpoint = file_name.replace(".py", "")
    full_url = f"{SITE_URL}/api/{api_endpoint}"

    # 构建发射确认信息
    launch_msg = f"即将把 {file_name} 注入云端...\n"
    if req_file_path:
        launch_msg += "\n📦 附加装备：依赖库 (requirements.txt) 将同步更新！\n"
    launch_msg += f"\n部署完成后，H5 页面即可通过以下地址调用：\n{full_url}"

    messagebox.showinfo("准备发射", launch_msg)

    try:
        # --- 步骤 3：智能文件装填 ---
        # 1. Python 脚本装入 api 目录
        os.makedirs(API_DEPLOY_DIR, exist_ok=True)
        shutil.copy2(py_file_path, os.path.join(API_DEPLOY_DIR, file_name))

        # 2. requirements 文件强行装入发射台根目录 (解决 Vercel 识别不到的大坑)
        if req_file_path:
            # 无论原文件叫什么，到了这里一律改名叫 requirements.txt
            shutil.copy2(req_file_path, os.path.join(DEPLOY_DIR, "requirements.txt"))

        # --- 步骤 4：调用 Git 引擎一键升空 ---
        run_cmd("git add .", cwd=DEPLOY_DIR)
        
        # 动态生成提交日志
        commit_msg = f"Auto Deploy API: {file_name} with requirements" if req_file_path else f"Auto Deploy API: {file_name}"
        run_cmd(f'git commit -m "{commit_msg}"', cwd=DEPLOY_DIR)
        
        push_success, push_err = run_cmd("git push", cwd=DEPLOY_DIR)

        # --- 步骤 5：结果判定 ---
        if push_success or "Everything up-to-date" in push_err:
            success_msg = (
                f"🚀 Python 脚本发射完毕！\n\n"
                f"云端接口地址：\n{full_url}\n\n"
                f"注意：Vercel 云端安装库文件需要时间，请等待约 30~60 秒后再访问接口。"
            )
            messagebox.showinfo("发布成功", success_msg)
        else:
            messagebox.showerror("推送失败", f"向 GitHub 推送数据失败，Vercel 无法触发更新。\n错误信息:\n{push_err}")

    except Exception as e:
        messagebox.showerror("系统内部错误", f"处理文件时发生异常：\n{str(e)}")

if __name__ == "__main__":
    main()