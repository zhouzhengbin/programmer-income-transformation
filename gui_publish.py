#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import shutil
import csv
from datetime import datetime
import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox

# ==========================================
# 核心配置区
# ==========================================
MAIN_DOMAIN = "zhouzhengbin.site"

# 网站发布的根目录
# 注意：如果你在本地 Windows 测试，请先改成如 "D:/test_web" 避免报错
# 如果直接在服务器或挂载盘运行，保持 "/var/www/zhouzhengbin.site" 即可
BASE_WEB_DIR = "/var/www/zhouzhengbin.site"

# 记录发布情况的表格文件路径（会在脚本同目录下生成）
LOG_FILE = "publish_records.csv"

def log_to_csv(subdomain, source_file, status):
    """
    将发布记录写入 CSV 表格（支持 Excel 直接打开）
    """
    file_exists = os.path.isfile(LOG_FILE)
    
    # 使用 utf-8-sig 编码，确保用 Windows Excel 打开时中文不会乱码
    with open(LOG_FILE, mode='a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        
        # 如果文件是新建的，先写入表头
        if not file_exists:
            writer.writerow(["发布时间", "二级域名", "完整网址", "本地源文件", "发布状态"])
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        full_url = f"http://{subdomain}.{MAIN_DOMAIN}"
        writer.writerow([timestamp, subdomain, full_url, source_file, status])

def main():
    # 初始化 Tkinter，并隐藏主窗口（我们只需要弹框）
    root = tk.Tk()
    root.withdraw()

    # ---------------- 步骤 1：弹框选择网页文件 ----------------
    file_path = filedialog.askopenfilename(
        title="第一步：请选择要发布的网页文件 (HTML)",
        filetypes=[("HTML 网页文件", "*.html"), ("所有文件", "*.*")]
    )
    
    if not file_path:
        messagebox.showwarning("已取消", "您没有选择任何文件，发布流程已终止。")
        sys.exit(0)

    # ---------------- 步骤 2：弹框输入二级域名 ----------------
    subdomain = simpledialog.askstring(
        title="第二步：设置二级域名",
        prompt=f"已选择: {os.path.basename(file_path)}\n\n请输入你想设置的二级域名前缀：\n(例如输入 'money' 将发布到 money.{MAIN_DOMAIN})"
    )
    
    if not subdomain:
        messagebox.showwarning("已取消", "您没有输入二级域名，发布流程已终止。")
        sys.exit(0)
        
    # 去除首尾空格，防止输入错误
    subdomain = subdomain.strip()

    # ---------------- 步骤 3：执行自动发布并记录表格 ----------------
    target_dir = os.path.join(BASE_WEB_DIR, subdomain)
    
    try:
        # 1. 创建目标目录
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            
        # 2. 复制文件并重命名为 index.html
        target_file = os.path.join(target_dir, "index.html")
        shutil.copy2(file_path, target_file)
        
        # 3. 记录到表格 (成功)
        log_to_csv(subdomain, file_path, "成功")
        
        # 4. 弹出成功提示框
        success_msg = f"网站发布成功！\n\n您的网址是：\nhttp://{subdomain}.{MAIN_DOMAIN}\n\n发布记录已自动更新到表格 {LOG_FILE} 中。"
        messagebox.showinfo("发布成功", success_msg)
        
    except PermissionError:
        # 权限报错处理
        error_msg = f"权限不足！无法在 {BASE_WEB_DIR} 创建文件夹或写入文件。\n请确保你有足够的权限运行此脚本。"
        log_to_csv(subdomain, file_path, "失败 (权限不足)")
        messagebox.showerror("发布失败", error_msg)
        
    except Exception as e:
        # 其他未知错误处理
        log_to_csv(subdomain, file_path, f"失败 ({str(e)})")
        messagebox.showerror("发布失败", f"发生错误：\n{e}")

if __name__ == "__main__":
    main()