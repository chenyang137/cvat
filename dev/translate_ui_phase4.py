#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CVAT UI 汉化脚本 第四阶段 —— 工具提示(title)、筛选器配置、杂项
处理 title 属性、placeholder 属性、筛选器配置项等遗漏的英文字符串
"""

import os
import re
import sys
from pathlib import Path

# ============================================================
# 第四阶段翻译词典
# ============================================================
TRANSLATIONS: list[tuple[str, str]] = [
    # ─── 工具提示 (title= / Tooltip) ─────────────────────────
    ("Objects color mode may be by object, label, or group", "对象着色模式可按对象、标签或分组"),
    ("Go to the next attribute", "转到下一个属性"),
    ("Go to the previous attribute", "转到上一个属性"),
    ("Change locked state for an active object", "更改活动对象的锁定状态"),
    ("Change occluded property for an active object", "更改活动对象的遮挡属性"),
    ("Change pinned property for an active object", "更改活动对象的固定属性"),
    ("Go to the next keyframe of an active track", "转到活动轨迹的下一个关键帧"),
    ("Go to the previous keyframe of an active track", "转到活动轨迹的上一个关键帧"),
    ("Activate brush tool on masks drawing toolbox", "在掩码绘制工具箱中激活画笔工具"),
    ("Activate eraser tool on masks drawing toolbox", "在掩码绘制工具箱中激活橡皮擦工具"),
    ("Activate polygon tool on masks drawing toolbox", "在掩码绘制工具箱中激活多边形工具"),
    ("Activate polygon remove tool on masks drawing toolbox", "在掩码绘制工具箱中激活多边形删除工具"),
    ("Toggle automatic snap to contour for polygons and polylines during drawing/editing", "在绘制/编辑期间切换多边形和折线的自动吸附到轮廓"),
    ("Toggle automatic snapping to nearby points", "切换到附近点的自动吸附"),
    ("Go to the next object and center it on the canvas", "转到下一个对象并将其居中显示在画布上"),
    ("Go to the previous object and center it on the canvas", "转到上一个对象并将其居中显示在画布上"),
    ("Increases camera roll angle", "增大相机翻滚角"),
    ("Decreases camera roll angle", "减小相机翻滚角"),
    ("Decreases camera pitch angle", "减小相机俯仰角"),
    ("Increases camera pitch angle", "增大相机俯仰角"),
    ("Move the camera up", "向上移动相机"),
    ("Move the camera down", "向下移动相机"),
    ("Move the camera left", "向左移动相机"),
    ("Move the camera right", "向右移动相机"),
    ("Create a new issues in the review workspace", "在审核工作区创建新问题"),
    ("Cancel any active canvas mode", "取消任何活动的画布模式"),
    ("Delete an active object. Use shift to force delete of locked objects", "删除活动对象。使用 Shift 强制删除锁定对象"),
    ("Hide currently edited mask", "隐藏当前编辑的掩码"),
    ("Reset group for selected shapes (in group mode)", "重置所选形状的分组（分组模式下）"),
    ("Activate or deactivate mode to merging shapes", "激活或停用合并形状模式"),
    ("Activate or deactivate mode to splitting shapes", "激活或停用拆分形状模式"),
    ("Change image angle (add 90 degrees)", "更改图像角度（加 90 度）"),
    ("Change image angle (subtract 90 degrees)", "更改图像角度（减 90 度）"),
    ("Paste a shape from internal CVAT clipboard", "从 CVAT 内部剪贴板粘贴形状"),
    ("Remove selected shape and redraw it from scratch", "删除所选形状并从头重绘"),
    ("Activate or deactivate mode to grouping shapes", "激活或停用分组形状模式"),
    ("Activate or deactivate a mode where you can join polygons and masks", "激活或停用可连接多边形和掩码的模式"),
    ("Activate or deactivate a mode to slice a polygon/mask", "激活或停用切片多边形/掩码的模式"),
    ("Tracker needs to know when annotations is reset in the job", "跟踪器需要知道作业中的标注何时被重置"),
    ("Probably, you should consider updating the serverless function", "您可能需要考虑更新无服务器函数"),
    ("Change label of a selected object or default label of the next created object if", "更改所选对象的标签或下一个创建对象的默认标签"),
    ("Postpone running the algorithm for interaction tools", "推迟运行交互工具的算法"),
    ("Cancel the latest action related with objects", "撤销与对象相关的最新操作"),
    ("Cancel undo action", "撤销重做操作"),
    ("Submit unsaved changes of annotations to the server", "将未保存的标注更改提交到服务器"),
    ("Go to the next chapter", "转到下一章节"),
    ("Start/stop automatic changing frames", "开始/停止自动切换帧"),
    ("Go to the next frame", "转到下一帧"),
    ("Go to the previous frame", "转到上一帧"),
    ("Go forward with a step", "按步长前进"),
    ("Go backward with a step", "按步长后退"),
    ("Search the next frame that satisfies to the filters", "搜索满足筛选条件的下一帧"),
    ("Search the previous frame that satisfies to the filters", "搜索满足筛选条件的上一帧"),
    ("Go to the previous chapter", "转到上一章节"),
    ("Delete frame", "删除帧"),
    ("Focus on the element to change the current frame", "聚焦该元素以更改当前帧"),
    ("Open search frame by name dialog", "打开按名称搜索帧的对话框"),
    ("Select all resources", "全选资源"),
    ("Interrupts drawing a new skeleton edge", "中断绘制新的骨架边"),
    ("The grid is used to UI development", "此网格用于 UI 开发"),
    ("Set the next color for an activated shape", "为激活的形状设置下一个颜色"),
    ("Activate simplification mode for the selected polygon or polyline", "为选中的多边形或折线激活简化模式"),
    ("Change locked state for all objects in the side bar", "更改侧栏中所有对象的锁定状态"),
    ("Change hidden state for objects in the side bar", "更改侧栏中对象的隐藏状态"),
    ("Change hidden state for an active object", "更改活动对象的隐藏状态"),
    ("Move an active object to the newly created background layer (decrease z-order value)", "将活动对象移至新创建的背景层（降低 z 序值）"),
    ("Move an active object to the newly created foreground layer (increase z-order value)", "将活动对象移至新创建的前景层（提高 z 序值）"),
    ("Move an active object one layer backward (decrease z-order value)", "将活动对象向后移一层（降低 z 序值）"),
    ("Move an active object one layer forward (increase z-order value)", "将活动对象向前移一层（提高 z 序值）"),
    ("Copy shape to CVAT internal clipboard", "将形状复制到 CVAT 内部剪贴板"),
    ("Opens a dialog with annotations actions", "打开标注操作对话框"),
    ("Make a copy of the object on the following frames", "在以下帧上创建对象的副本"),
    ("Lightweight client-side algorithm, useful to track simple objects", "轻量级客户端算法，适用于跟踪简单对象"),
    ("Data transfer between workspaces", "工作区之间的数据传输"),

    # ─── 筛选器配置项 ─────────────────────────────────────
    ("Key & secret key", "密钥和密钥对"),
    ("Account name & token", "账户名称和令牌"),

    # ─── API Token 卡片 ────────────────────────────────────
    ("Permissions", "权限"),
    ("Expires", "过期时间"),
    ("Last Used", "最后使用"),
    ("Revoke API Token", "撤销 API 令牌"),

    # ─── 任务维度筛选 ──────────────────────────────────────
    ("Video", "视频"),
    ("Images", "图像"),

    # ─── 形状/标签类型筛选 ────────────────────────────────
    ("Shape", "形状"),
    ("Tag", "标签"),

    # ─── 组织操作 ──────────────────────────────────────────
    ("You are removing username from this organization", "您正在从组织中移除用户"),
    ("The person will not have access to the organization data anymore. Continue?", "此人将不再有权访问组织数据。继续吗？"),

    # ─── 创建任务验证 ──────────────────────────────────────
    ("A task must contain at least one file", "任务必须包含至少一个文件"),
    ("Sorting method has been updated as Honeypots", "排序方法已更新为蜜罐"),

    # ─── 问题追踪器 ──────────────────────────────────────
    ("Issue tracker is expected to be URL", "问题追踪器应为 URL"),

    # ─── 导入标注 ──────────────────────────────────────────
    ("Current annotation will be lost", "当前标注将丢失"),
    ("You are going to upload new annotations to", "您将上传新标注到"),

    # ─── 设置恢复默认 ──────────────────────────────────────
    ("Are you sure you want to restore defaults?", "确定要恢复默认设置吗？"),

    # ─── 无效页面 ──────────────────────────────────────────
    ("Invalid page", "无效页面"),

    # ─── 杂项 ──────────────────────────────────────────────
    ("Create a new tag with corresponding class", "创建具有相应类的新标签"),
    ("Add a new tag, corresponding to the selected label.", "添加与所选标签对应的新标签。"),
]


# ============================================================
# 辅助函数
# ============================================================

def should_skip_file(file_path: str) -> bool:
    skip_patterns = ['__tests__', '.test.', '.spec.', 'node_modules', '.d.ts']
    return any(p in file_path for p in skip_patterns)


def build_rules() -> list[tuple[str, str]]:
    """按长度降序排列，确保长字符串优先匹配"""
    sorted_trans = sorted(TRANSLATIONS, key=lambda x: len(x[0]), reverse=True)
    return [(re.escape(en), zh) for en, zh in sorted_trans]


def translate_content(content: str, rules: list[tuple[str, str]]) -> tuple[str, int]:
    total = 0
    for en_esc, zh in rules:
        # 1. 双引号字符串
        new, n = re.subn(r'"' + en_esc + r'"', f'"{zh}"', content)
        if n:
            content, total = new, total + n

        # 2. 单引号字符串
        new, n = re.subn(r"'" + en_esc + r"'", f"'{zh}'", content)
        if n:
            content, total = new, total + n

        # 3. JSX 同行文本
        new, n = re.subn(
            r'(>[ \t]*)(' + en_esc + r')([ \t]*(?:<|[\r\n]))',
            r'\g<1>' + zh + r'\g<3>', content
        )
        if n:
            content, total = new, total + n

        # 4. JSX 独占行文本
        new, n = re.subn(
            r'^([ \t]*)(' + en_esc + r')([ \t]*)$',
            r'\g<1>' + zh + r'\g<3>', content,
            flags=re.MULTILINE
        )
        if n:
            content, total = new, total + n

        # 5. 反引号模板字符串
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

    print(f'{"[预览] " if args.dry_run else ""}第四阶段汉化 {src}')
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
