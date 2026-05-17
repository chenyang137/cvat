#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CVAT UI 汉化脚本 第五阶段 —— 残余工具提示、标题、按钮文本
"""

import os
import re
import sys
from pathlib import Path

TRANSLATIONS: list[tuple[str, str]] = [
    # ─── 工具提示/标题 ────────────────────────────────────
    ("Fit views", "适应视图"),
    ("Add context image", "添加上下文图像"),
    ("Reload layout", "重新加载布局"),
    ("Brush size [Hold Alt + Right Mouse Click + Drag Left/Right]",
     "笔刷大小 [按住 Alt + 鼠标右键 + 左右拖动]"),
    ("Quick issue ...", "快速提问..."),
    ("Delete point [Alt + dblclick]", "删除点 [Alt + 双击]"),
    ("Performs zoom in", "放大"),
    ("Performs zoom out", "缩小"),
    ("Open an issue", "提出问题"),
    ("Draw an ellipse", "绘制椭圆"),
    ("Draw a polyline", "绘制折线"),
    ("OpenCV tools", "OpenCV 工具"),
    ("Select a region of interest", "选择感兴趣区域"),
    ("Go to the first frame", "转到第一帧"),
    ("Go to the last frame", "转到最后一帧"),
    ("Restore the frame", "恢复帧"),
    ("Copy frame filename", "复制帧文件名"),
    ("Create frame URL", "创建帧 URL"),
    ("Chapters", "章节"),
    ("Select chapter", "选择章节"),
    ("Shapes / Tracks", "形状 / 轨迹"),
    ("Prefix is used to filter bucket content", "前缀用于筛选存储桶内容"),
    ("More information", "更多信息"),
    ("Redirecting to login page after...", "正在跳转到登录页面..."),
    ("If a task uses media from a cloud storage, its possible to make a backup without",
     "如果任务使用云存储中的媒体，可以创建不含媒体的备份"),
    ("The option is relevant for formats that work with masks only",
     "此选项仅适用于处理掩码的格式"),
    ("Update attributes", "更新属性"),
    ("Delete label", "删除标签"),
    ("Do not save the label and return", "不保存标签并返回"),
    ("Change color of the label", "更改标签颜色"),
    ("Save labels", "保存标签"),
    ("Reset all changes", "重置所有更改"),
    ("Upload a background image", "上传背景图像"),
    ("Click the canvas to add a point", "点击画布添加点"),
    ("Click and drag points", "点击并拖动点"),
    ("Click two points to setup an edge", "点击两个点来设置边"),
    ("Lower values create simpler shapes with fewer points. Higher values preserve more detail",
     "较低的值创建更简单的形状，点更少。较高的值保留更多细节"),
    ("Create a new tag with corresponding class. The class may be setup in tag annotation settings",
     "创建具有相应类的新标签。该类可以在标签标注设置中配置"),
    ("Change label of a selected object or default label of the next created object",
     "更改所选对象的标签或下一个创建对象的默认标签"),
]


def should_skip_file(file_path: str) -> bool:
    skip_patterns = ['__tests__', '.test.', '.spec.', 'node_modules', '.d.ts']
    return any(p in file_path for p in skip_patterns)


def build_rules() -> list[tuple[str, str]]:
    sorted_trans = sorted(TRANSLATIONS, key=lambda x: len(x[0]), reverse=True)
    return [(re.escape(en), zh) for en, zh in sorted_trans]


def translate_content(content: str, rules: list[tuple[str, str]]) -> tuple[str, int]:
    total = 0
    for en_esc, zh in rules:
        new, n = re.subn(r'"' + en_esc + r'"', f'"{zh}"', content)
        if n:
            content, total = new, total + n

        new, n = re.subn(r"'" + en_esc + r"'", f"'{zh}'", content)
        if n:
            content, total = new, total + n

        new, n = re.subn(
            r'(>[ \t]*)(' + en_esc + r')([ \t]*(?:<|[\r\n]))',
            r'\g<1>' + zh + r'\g<3>', content
        )
        if n:
            content, total = new, total + n

        new, n = re.subn(
            r'^([ \t]*)(' + en_esc + r')([ \t]*)$',
            r'\g<1>' + zh + r'\g<3>', content,
            flags=re.MULTILINE
        )
        if n:
            content, total = new, total + n

        new, n = re.subn(r'`' + en_esc + r'`', f'`{zh}`', content)
        if n:
            content, total = new, total + n

    return content, total


def process_file(path: str, rules: list[tuple[str, str]], dry_run: bool = False) -> tuple[int, bool]:
    if should_skip_file(path):
        return 0, False
    try:
        original = open(path, encoding='utf-8').read()
    except Exception as e:
        print(f'  [跳过] {path}: {e}')
        return 0, False
    new_content, count = translate_content(original, rules)
    if count and not dry_run:
        open(path, 'w', encoding='utf-8').write(new_content)
    return count, count > 0


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--src', default='/Users/luochenyang/Downloads/cvat/cvat-ui/src')
    args = parser.parse_args()
    src = Path(args.src)
    if not src.exists():
        print(f'目录不存在: {src}')
        sys.exit(1)
    print(f'{"[预览] " if args.dry_run else ""}第五阶段汉化 {src}')
    print(f'词条数：{len(TRANSLATIONS)}')
    print('=' * 60)
    rules = build_rules()
    files = [str(f) for f in sorted(src.rglob('*.tsx')) + sorted(src.rglob('*.ts'))
             if not should_skip_file(str(f))]
    changed_files, total_replacements = 0, 0
    for fp in files:
        count, changed = process_file(fp, rules, dry_run=args.dry_run)
        if changed:
            rel = os.path.relpath(fp, str(src))
            print(f'  [{count:4d}] {rel}')
            changed_files += 1
            total_replacements += count
    print('=' * 60)
    print(f'文件总数：{len(files)}，已修改：{changed_files}，替换次数：{total_replacements}')
    if args.dry_run:
        print('[预览模式：未写入文件]')


if __name__ == '__main__':
    main()
