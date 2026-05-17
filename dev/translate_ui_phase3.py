#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CVAT UI 汉化脚本 第三阶段 —— 处理模板字符串和 notifications-reducer 中的通知消息
使用逐行 + 多行精确匹配方式，处理含 ${variable} 的反引号模板字符串。
"""

import os
import re
import sys
from pathlib import Path

# ============================================================
# 第三阶段翻译词典
# 对于含 ${} 的模板字符串，保留 ${} 不变，翻译其他部分
# ============================================================

# 普通字符串翻译（不含 ${} 的）
SIMPLE_TRANSLATIONS: dict[str, str] = {
    "Invalid name": "名称无效",
    "Task parameters were automatically updated": "任务参数已自动更新",
    "The field is required.": "此字段为必填项。",
    "Request current progress": "请求当前进度",
    "Bulk backup export started": "批量备份导出已开始",
    "Incorrect region": "区域不正确",
    "This region already exists": "该区域已存在",
    "Manifest file must have .jsonl extension": "清单文件必须具有 .jsonl 扩展名",
    "Wrong skeleton structure": "骨架结构错误",
    "The cloud storage has been attached": "云存储已附加",
    "The cloud storage has been updated": "云存储已更新",

    # notifications-reducer.ts 中的纯文本消息
    "Could not check authentication on the server": "无法在服务器上验证身份",
    "Could not login on the server": "无法登录服务器",
    "Could not logout from the server": "无法登出服务器",
    "Could not register on the server": "无法在服务器上注册",
    "New password has been saved.": "新密码已保存。",
    "Could not change password": "无法修改密码",
    "Could not reset password on the server.": "无法在服务器上重置密码。",
    "Password has been reset with the new password.": "密码已使用新密码重置。",
    "Could not set new password on the server.": "无法在服务器上设置新密码。",
    "Could not update user information.": "无法更新用户信息。",
    "Could not receive server schema": "无法获取服务器架构",
    "Could not get invitations": "无法获取邀请",
    "Could not accept invitation": "无法接受邀请",
    "Could not decline invitation": "无法拒绝邀请",
    "Could not resend invitation": "无法重新发送邀请",
    "Invitation was sent successfully": "邀请发送成功",
    "Export is finished": "导出完成",
    "Backup export is finished": "备份导出完成",
    "Annotations import is finished": "标注导入完成",
    "Import backup is finished": "备份导入完成",
    "Could not fetch tasks": "无法获取任务",
    "Could not create the task": "无法创建任务",
    "Could not fetch projects": "无法获取项目",
    "Could not create the project": "无法创建项目",
    "Could not get formats from the server": "无法从服务器获取格式",
    "Could not get info about the server": "无法获取服务器信息",
    "Could not fetch models meta information": "无法获取模型元信息",
    "Could not get models from the server": "无法从服务器获取模型",
    "Error during fetching a job": "获取作业时出错",
    "Could not save annotations": "无法保存标注",
    "Could not update annotations": "无法更新标注",
    "Could not create annotations": "无法创建标注",
    "Could not merge annotations": "无法合并标注",
    "Could not group annotations": "无法分组标注",
    "Could not join annotations": "无法连接标注",
    "Could not slice the object": "无法切片对象",
    "Could not split the track": "无法拆分轨迹",
    "Could not remove the object": "无法移除对象",
    "Could not propagate the object": "无法传播对象",
    "Could not collect annotations statistics": "无法收集标注统计",
    "Could not remove annotations": "无法删除标注",
    "Could not fetch annotations": "无法获取标注",
    "Could not redo": "无法重做",
    "Could not undo": "无法撤销",
    "Could not execute search annotations": "无法搜索标注",
    "Could not send logs to the server": "无法发送日志到服务器",
    "Could not reset the state": "无法重置状态",
    "Could not get user agreements from the server": "无法从服务器获取用户协议",
    "Could not open a new issue": "无法创建新问题",
    "Could not resolve the issue": "无法解决问题",
    "Could not reopen the issue": "无法重新打开问题",
    "Could not fetch requests from the server": "无法从服务器获取请求",
    "Could not cancel the request": "无法取消请求",
    "Could not delete the request": "无法删除请求",
    "Could not comment the issue": "无法评论问题",
    "Could not receive image data": "无法获取图像数据",
    "Canvas error occurred": "画布错误",
    "Could not delete frame": "无法删除帧",
    "Could not restore frame": "无法恢复帧",
    "Could not fetch cloud storage": "无法获取云存储",
    "Could not create the cloud storage": "无法创建云存储",
    "Could not create job": "无法创建作业",
    "Could not update job": "无法更新作业",
    "Could not fetch a list of webhooks": "无法获取 Webhook 列表",
    "Could not create webhook": "无法创建 Webhook",
    "Could not update webhook": "无法更新 Webhook",
    "Could not delete webhook": "无法删除 Webhook",
    "Bulk operation failed.": "批量操作失败。",
    "Could not get API tokens": "无法获取 API 令牌",
    "Could not create API token": "无法创建 API 令牌",
    "Could not update API token": "无法更新 API 令牌",
    "Could not revoke API token": "无法撤销 API 令牌",
    "Could not fetch a list of jobs": "无法获取作业列表",
    "Could not fetch the list of organizations": "无法获取组织列表",
    "Could not invite organization members": "无法邀请组织成员",
    "Could not leave the organization": "无法退出组织",
}

# 模板字符串翻译（含 ${} 的），用正则逐行匹配
# 格式：(原文字符串, 译文)
# 原文中 ${...} 保留不变
TEMPLATE_TRANSLATIONS: list[tuple[str, str]] = [
    # notifications-reducer.ts 模板字符串
    ("Could not receive guide for the ${instanceType} ${id}",
     "无法获取${instanceType} ${id}的指南"),
    ("Creation of ${count} tasks have been canceled",
     "已取消创建 ${count} 个任务"),
    ("Short name must not exceed ${MAX_SLUG_LEN} characters",
     "简称不能超过 ${MAX_SLUG_LEN} 个字符"),
    ("Full name must not exceed ${MAX_NAME_LEN} characters",
     "全称不能超过 ${MAX_NAME_LEN} 个字符"),
    ("You finished working on frame ${latestFrame}",
     "您已完成帧 ${latestFrame} 的工作"),
    ("Could not fetch context images. Frame: ${frameIndex}",
     "无法获取上下文图像。帧：${frameIndex}"),
    ("The ${instanceType} creating from the backup has been started",
     "从备份创建${instanceType}已开始"),
    ("Last delivery was successful. Response: ${status}",
     "最近推送成功。响应：${status}"),
    ("Last delivery was not successful. Response: ${status}",
     "最近推送失败。响应：${status}"),
    ("Bulk ${resource.toLowerCase()} export started",
     "批量${resource.toLowerCase()}导出已开始"),
    ("${resource} export started",
     "${resource} 导出已开始"),
    ("Could not receive requested ${type}",
     "无法获取请求的${type}"),
    ("${resToPrint} import started",
     "${resToPrint} 导入已开始"),
    ("Exporting ${resourceName}: ${loadedCount} of ${totalCount}",
     "正在导出 ${resourceName}：${loadedCount}/${totalCount}"),
    ("Could not delete the [task #${taskID}](/tasks/${taskID})",
     "无法删除[任务 #${taskID}](/tasks/${taskID})"),
    ("Could not delete [project #${projectId}](/project/${projectId})",
     "无法删除[项目 #${projectId}](/project/${projectId})"),
    ("Automatic annotation accomplished for the ",
     "自动标注完成："),
    ("Fetching inference status for the [task #${taskID}](/tasks/${taskID})",
     "正在获取[任务 #${taskID}](/tasks/${taskID})的推理状态"),
    ("Could not infer model for the [task #${taskID}](/tasks/${taskID})",
     "无法对[任务 #${taskID}](/tasks/${taskID})进行模型推理"),
    ("Could not cancel model inference for the [task #${taskID}](/tasks/${taskID})",
     "无法取消[任务 #${taskID}](/tasks/${taskID})的模型推理"),
    ("Could not receive frame ${action.payload.number}",
     "无法获取帧 ${action.payload.number}"),
    ("Could not update cloud storage #${cloudStorage.id}",
     "无法更新云存储 #${cloudStorage.id}"),
    ("Could not fetch content for cloud storage #${cloudStorageID}",
     "无法获取云存储 #${cloudStorageID} 的内容"),
    ("Could not fetch cloud storage #${cloudStorageID} status",
     "无法获取云存储 #${cloudStorageID} 的状态"),
    ("Could not fetch preview for cloud storage #${cloudStorageID}",
     "无法获取云存储 #${cloudStorageID} 的预览"),
    ("Could not create organization ${action.payload.slug}",
     "无法创建组织 ${action.payload.slug}"),
    ("Could not update organization \"${slug}\"",
     "无法更新组织 \"${slug}\""),
    ("Could not activate organization ${action.payload.slug || ''}",
     "无法激活组织 ${action.payload.slug || ''}"),
    ("Could not remove organization ${action.payload.slug}",
     "无法删除组织 ${action.payload.slug}"),
    ("Could not invite this member \"${action.payload.email}\" to the organization",
     "无法邀请成员 \"${action.payload.email}\" 加入组织"),
    ("Could not remove member \"${action.payload.username}\" from the organization",
     "无法从组织中移除成员 \"${action.payload.username}\""),
    ("Could not assign role \"${role}\" to the user \"${username}\"",
     "无法为用户 \"${username}\" 分配角色 \"${role}\""),
    ("Could not delete the job #${jobID}",
     "无法删除作业 #${jobID}"),
    ("Could not remove issue from the server",
     "无法从服务器删除问题"),
    ("Could not submit review for the job ${action.payload.jobId}",
     "无法提交作业 ${action.payload.jobId} 的审核"),
    # 邀请通知（含 markdown 链接）
    ("You've received an invitation to join an organization! [Click here](/invitations) to get details.",
     "您收到了加入组织的邀请！[点击此处](/invitations)查看详情。"),
    ("The input is not a valid E-mail",
     "输入的邮箱格式无效"),
]


# ============================================================
# 逐文件精确替换
# ============================================================

def should_skip_file(file_path: str) -> bool:
    skip_patterns = ['__tests__', '.test.', '.spec.', 'node_modules', '.d.ts']
    return any(p in file_path for p in skip_patterns)


def translate_simple(content: str) -> tuple[str, int]:
    """翻译不含 ${} 的简单字符串"""
    total = 0
    # 按长度降序排列，长字符串优先
    items = sorted(SIMPLE_TRANSLATIONS.items(), key=lambda x: len(x[0]), reverse=True)

    for en, zh in items:
        en_esc = re.escape(en)
        count = 0

        # 1. 双引号
        new, n = re.subn(r'"' + en_esc + r'"', f'"{zh}"', content)
        if n:
            content = new
            count += n

        # 2. 单引号
        new, n = re.subn(r"'" + en_esc + r"'", f"'{zh}'", content)
        if n:
            content = new
            count += n

        # 3. JSX 同行文本
        new, n = re.subn(
            r'(>[ \t]*)(' + en_esc + r')([ \t]*(?:<|[\r\n]))',
            r'\g<1>' + zh + r'\g<3>', content
        )
        if n:
            content = new
            count += n

        # 4. JSX 独占行文本
        new, n = re.subn(
            r'^([ \t]*)(' + en_esc + r')([ \t]*)$',
            r'\g<1>' + zh + r'\g<3>', content,
            flags=re.MULTILINE
        )
        if n:
            content = new
            count += n

        total += count

    return content, total


def translate_templates(content: str) -> tuple[str, int]:
    """翻译含 ${} 的模板字符串（反引号内）"""
    total = 0
    # 按长度降序排列
    items = sorted(TEMPLATE_TRANSLATIONS, key=lambda x: len(x[0]), reverse=True)

    for en, zh in items:
        en_esc = re.escape(en)
        # 在反引号模板字符串中替换
        new, n = re.subn(r'`' + en_esc + r'`', f'`{zh}`', content)
        if n:
            content = new
            total += n

        # 也匹配 message: `...` 格式
        new, n = re.subn(r'(`)' + en_esc + r'(`)', f'`{zh}`', content)
        if n:
            content = new
            total += n

    return content, total


def process_file(path: str, dry_run: bool = False) -> tuple[int, bool]:
    if should_skip_file(path):
        return 0, False
    try:
        original = open(path, encoding='utf-8').read()
    except Exception as e:
        print(f'  [跳过] {path}: {e}')
        return 0, False

    content = original
    total = 0

    # 先处理模板字符串（含 ${}），再处理简单字符串
    content, n1 = translate_templates(content)
    total += n1

    content, n2 = translate_simple(content)
    total += n2

    changed = total > 0
    if changed and not dry_run:
        open(path, 'w', encoding='utf-8').write(content)
    return total, changed


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

    print(f'{"[预览] " if args.dry_run else ""}第三阶段汉化 {src}')
    print(f'简单词条：{len(SIMPLE_TRANSLATIONS)}，模板词条：{len(TEMPLATE_TRANSLATIONS)}')
    print('=' * 60)

    files = [str(f) for f in sorted(src.rglob('*.tsx')) + sorted(src.rglob('*.ts'))
             if not should_skip_file(str(f))]

    changed_files, total_replacements = 0, 0
    for fp in files:
        count, changed = process_file(fp, dry_run=args.dry_run)
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
