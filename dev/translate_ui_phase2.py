#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CVAT UI 汉化脚本 第二阶段 —— 补充遗漏的通知/警告/错误/确认/验证/空状态等
对 cvat-ui/src 下所有 .tsx / .ts 文件中的 UI 可见文本进行中文替换。
应在 translate_ui.py 之后运行。
"""

import os
import re
import sys
from pathlib import Path

# ============================================================
# 第二阶段翻译词典（长字符串优先）
# ============================================================
TRANSLATIONS: list[tuple[str, str]] = [
    # ─── 错误通知 ────────────────────────────────────────────────
    ("Could not receive guide for the", "无法获取指南："),
    ("Could not save guide on the server", "无法在服务器上保存指南"),
    ("Could not create a server asset", "无法创建服务器资源"),
    ("Could not create a task", "无法创建任务"),
    ("CSV export failed", "CSV 导出失败"),
    ("Could not export events for the target resource", "无法导出目标资源的事件"),
    ("Could not receive the target resource from the server", "无法从服务器获取目标资源"),
    ("Could not save quality settings", "无法保存质量设置"),
    ("Interaction error occurred", "交互错误"),
    ("Tracking error occurred", "跟踪错误"),
    ("Interactor API is outdated", "交互器 API 已过时"),
    ("Tracker initialization error", "跟踪器初始化错误"),
    ("Tracking error", "跟踪错误"),
    ("Could not initialize contour utilities", "无法初始化轮廓工具"),
    ("Detection error occurred", "检测错误"),
    ("OpenCV.js processing error occurred", "OpenCV.js 处理错误"),
    ("Could not initialize OpenCV library", "无法初始化 OpenCV 库"),
    ("Image processing error occurred", "图像处理错误"),
    ("Could not fetch context images", "无法获取上下文图像"),
    ("Could not receive annotation guide", "无法获取标注指南"),
    ("Could not receive the requested project from the server", "无法从服务器获取请求的项目"),
    ("Could not get task details", "无法获取任务详情"),
    ("Could not fetch models", "无法获取模型"),
    ("Failed to fetch the webhook", "无法获取 Webhook"),
    ("Storage content fetching failed", "存储内容获取失败"),
    ("Could not fetch requested task from the server", "无法从服务器获取请求的任务"),
    ("Could not receive the requested task from the server", "无法从服务器获取请求的任务"),
    ("Could not fetch a list of cloud storages", "无法获取云存储列表"),
    ("Could not update the task", "无法更新任务"),
    ("Could not fetch task from the server", "无法从服务器获取任务"),
    ("Could not fetch a cloud storage", "无法获取云存储"),
    ("Could not receive requested", "无法获取请求的"),
    ("Could not receive quality settings", "无法获取质量设置"),
    ("Failed to load settings from local storage", "从本地存储加载设置失败"),
    ("Element does not refer to any label", "元素未引用任何标签"),
    ("Cannot connect to the server", "无法连接到服务器"),
    ("Automatic annotation failed", "自动标注失败"),

    # ─── 成功通知 ────────────────────────────────────────────────
    ("Annotation guide was saved successfully", "标注指南保存成功"),
    ("Export completed", "导出完成"),
    ("The task has been created", "任务已创建"),
    ("The tasks have been created", "任务已创建"),
    ("The project has been created", "项目已创建"),
    ("Webhook has been successfully updated", "Webhook 更新成功"),
    ("Webhook has been successfully added", "Webhook 添加成功"),
    ("Last delivery was successful", "最近推送成功"),
    ("Last delivery was not successful", "最近推送失败"),
    ("Automatic annotation accomplished", "自动标注完成"),

    # ─── 警告通知 ────────────────────────────────────────────────
    ("Some objects were deleted", "部分对象已删除"),
    ("No labels", "无标签"),
    ("This model does not have specified labels", "此模型未指定标签"),
    ("You finished working on frame", "您已完成帧的处理"),

    # ─── 确认对话框 - 云存储 ──────────────────────────────────────
    ("Delete selected cloud storages", "删除选中的云存储"),
    ("Please, confirm your action", "请确认您的操作"),
    ("All selected cloud storages will be permanently removed. Continue?",
     "所有选中的云存储将被永久删除。继续吗？"),
    ("You are going to remove the cloudstorage", "您将删除云存储"),
    ("Deleting cloud storage", "正在删除云存储"),

    # ─── 确认对话框 - 任务 ───────────────────────────────────────
    ("The consensus jobs will be merged", "共识作业将被合并"),
    ("Existing annotations in parent jobs will be updated. Continue?",
     "父作业中的现有标注将被更新。继续吗？"),
    ("Delete selected tasks", "删除选中的任务"),
    ("The task will be deleted", "任务将被删除"),
    ("All related data (images, annotations) for all selected tasks will be lost. Continue?",
     "所有选中任务的相关数据（图像、标注）将丢失。继续吗？"),
    ("All related data (images, annotations) will be lost. Continue?",
     "所有相关数据（图像、标注）将丢失。继续吗？"),
    ("All related data (annotations) for all selected jobs will be lost. Continue?",
     "所有选中作业的相关数据（标注）将丢失。继续吗？"),
    ("All related data (annotations) will be lost. Continue?",
     "所有相关数据（标注）将丢失。继续吗？"),
    ("You are going to cancel automatic annotation?",
     "确定要取消自动标注吗？"),
    ("Reached progress will be lost. Continue?",
     "已进行的进度将丢失。继续吗？"),

    # ─── 确认对话框 - 作业 ───────────────────────────────────────
    ("The consensus job will be merged", "共识作业将被合并"),
    ("Existing annotations in the parent job will be updated. Continue?",
     "父作业中的现有标注将被更新。继续吗？"),
    ("Delete selected jobs", "删除选中的作业"),
    ("The job will be deleted", "作业将被删除"),

    # ─── 确认对话框 - 项目 ──────────────────────────────────────
    ("Delete selected projects", "删除选中的项目"),
    ("The project will be deleted", "项目将被删除"),

    # ─── 确认对话框 - 帧删除 ────────────────────────────────────
    ("Do you want to delete frame", "确定要删除帧吗？"),
    ("The frame will not be visible in navigation and exported datasets, but it still can be restored with all the annotations.",
     "该帧在导航和导出的数据集中将不可见，但仍可连同所有标注一起恢复。"),

    # ─── 确认对话框 - 组织 ───────────────────────────────────────
    ("Please, confirm leaving the organization", "请确认退出组织"),
    ("You will not have access to the organization data anymore", "您将不再有权访问组织数据"),

    # ─── 确认对话框 - 标注 ──────────────────────────────────────
    ("Job state will be switched to", "作业状态将切换为"),
    ("You are about to remove all annotations from every frame.",
     "您将删除每一帧的所有标注。"),
    ("If you want to remove them from certain frames only, select a range below.",
     "如果只想删除特定帧的标注，请在下方选择范围。"),
    ("The issue will be deleted.", "该问题将被删除。"),
    ("Confirm propagation", "确认传播"),

    # ─── 确认对话框 - Webhook ───────────────────────────────────
    ("Are you sure you want to remove webhooks?",
     "确定要删除这些 Webhook 吗？"),
    ("They will stop notifying the specified URLs about listed events",
     "它们将停止向指定 URL 通知所列事件"),
    ("Are you sure you want to remove the hook?",
     "确定要删除此 Webhook 吗？"),
    ("It will stop notificating the specified URL about listed events",
     "它将停止向指定 URL 通知所列事件"),

    # ─── 确认对话框 - 标签 ──────────────────────────────────────
    ("Do you want to delete label?", "确定要删除标签吗？"),
    ("This action cannot be undone. All annotations associated to the label will be deleted.",
     "此操作不可撤销。与该标签关联的所有标注将被删除。"),
    ("Do you want to remove the attribute?", "确定要删除该属性吗？"),
    ("This action cannot be undone. All annotations associated to the attribute will be removed",
     "此操作不可撤销。与该属性关联的所有标注将被删除"),
    ("You are going to remove existing labels/attributes",
     "您将删除现有的标签/属性"),
    ("Following labels are going to be removed:", "以下标签将被删除："),
    ("Following attributes are going to be removed:", "以下属性将被删除："),
    ("All related annotations will be destroyed. Continue?",
     "所有相关标注将被销毁。继续吗？"),
    ("Delete existing data", "删除现有数据"),

    # ─── 确认对话框 - 快捷键 ────────────────────────────────────
    ("Conflicting shortcuts detected", "检测到快捷键冲突"),
    ("Added sequence conflicts with the following shortcuts:",
     "添加的序列与以下快捷键冲突："),
    ("Would you like to unset the conflicting shortcuts?",
     "是否取消冲突的快捷键？"),
    ("Invalid key combination", "无效的按键组合"),
    ("Only one non-modifier key can be used in a combination",
     "组合中只能使用一个非修饰键"),

    # ─── 确认对话框 - 质量 ──────────────────────────────────────
    ("Are you sure you want to force project settings?",
     "确定要强制应用项目设置吗？"),
    ("This action will override own settings in all tasks.",
     "此操作将覆盖所有任务中的自有设置。"),

    # ─── 确认对话框 - 邀请 ──────────────────────────────────────
    ("Would you like to decline the invitation to the", "确定要拒绝以下邀请吗？"),

    # ─── 确认对话框 - API Token ─────────────────────────────────
    ("Are you sure you want to revoke the token? This action cannot be undone.",
     "确定要撤销令牌吗？此操作不可撤销。"),

    # ─── 表单验证消息 ──────────────────────────────────────────────
    ("Please specify a first name", "请输入名"),
    ("Please specify a last name", "请输入姓"),
    ("The input is not valid E-mail!", "输入的邮箱格式无效！"),
    ("Please specify a username", "请输入用户名"),
    ("Password must be between 8 and 256 characters", "密码长度必须为 8 至 256 个字符"),
    ("Password must have at least 1 numeric characters", "密码必须包含至少 1 个数字"),
    ("Password must have at least 1 uppercase alphabetical character", "密码必须包含至少 1 个大写字母"),
    ("Password must have at least 1 lowercase alphabetical character", "密码必须包含至少 1 个小写字母"),
    ("Username must have at least 5 characters", "用户名至少需要 5 个字符"),
    ("Only characters (a-z), (A-Z), (0-9), -, _, . are available",
     "仅支持字母 (a-z)、(A-Z)、数字 (0-9)、-、_、."),
    ("Invalid attribute value", "属性值无效"),
    ("URL is not valid", "URL 无效"),
    ("Only Latin characters and numbers are allowed", "仅允许拉丁字符和数字"),
    ("Input phone number is not correct", "电话号码格式不正确"),
    ("Task name cannot be empty", "任务名称不能为空"),
    ("URL is not a valid URL", "URL 格式无效"),
    ("Segment size must be more than overlap size", "分段大小必须大于重叠大小"),
    ("Start frame must not be more than stop frame", "起始帧不能大于结束帧"),
    ("Value is not valid", "值无效"),

    # ─── 表单验证 - 组织 ─────────────────────────────────────────
    ("The input is not a valid email", "输入的邮箱格式无效"),
    ("Short name is a required field", "简称是必填项"),
    ("Short name must not exceed characters", "简称不能超过指定字符数"),
    ("Full name must not exceed characters", "全称不能超过指定字符数"),

    # ─── 表单验证 - 密码/安全 ────────────────────────────────────
    ("Please input your current password!", "请输入当前密码！"),
    ("Please enter a token name", "请输入令牌名称"),
    ("Token name must be at least 3 characters", "令牌名称至少需要 3 个字符"),
    ("Token name must not exceed 50 characters", "令牌名称不能超过 50 个字符"),

    # ─── 表单验证 - 导入/导出 ────────────────────────────────────
    ("The file is required", "必须选择文件"),
    ("No backup file specified", "未指定备份文件"),
    ("Format must be selected", "必须选择格式"),

    # ─── 表单验证 - 云存储 ───────────────────────────────────────
    ("Please, specify your access key ID", "请输入访问密钥 ID"),
    ("Please, specify your secret access key", "请输入秘密访问密钥"),
    ("Please, specify your account name", "请输入账户名称"),
    ("Please, specify your SAS token", "请输入 SAS 令牌"),
    ("Please, specify your connection string", "请输入连接字符串"),
    ("Please, specify a bucket name", "请输入存储桶名称"),
    ("Please, specify credentials type", "请选择凭证类型"),
    ("Please, specify a container name", "请输入容器名称"),
    ("Please, specify a display name", "请输入显示名称"),
    ("Please, specify a cloud storage provider", "请选择云存储服务商"),
    ("Please specify a manifest name", "请输入清单名称"),

    # ─── 表单验证 - 文件管理 ─────────────────────────────────────
    ("Please, specify a data source", "请指定数据源"),
    ("Please, select a files", "请选择文件"),

    # ─── 表单验证 - 作业 ─────────────────────────────────────────
    ("Please, specify Job type", "请指定作业类型"),
    ("Please, specify quantity", "请指定数量"),
    ("Please, specify frame count", "请指定帧数"),

    # ─── 表单验证 - 云存储选择 ──────────────────────────────────
    ("Please, specify a cloud storage", "请选择云存储"),

    # ─── 表单验证 - 移动任务 ──────────────────────────────────────
    ("Please, select a project", "请选择项目"),
    ("Please, specify mapping for all the labels", "请为所有标签指定映射"),

    # ─── 表单验证 - 问题 ──────────────────────────────────────────
    ("Please, fill out the field", "请填写此字段"),
    ("Please, describe the issue", "请描述问题"),

    # ─── 表单验证 - Webhook ──────────────────────────────────────
    ("Target URL cannot be empty", "目标 URL 不能为空"),

    # ─── 表单验证 - 标签 ──────────────────────────────────────────
    ("Please specify a name", "请指定名称"),
    ("Please specify values", "请指定值"),
    ("Please, specify a default value", "请指定默认值"),
    ("Please set a range", "请设置范围"),
    ("Attribute name must be unique for the label", "标签内的属性名称必须唯一"),
    ("Invalid attribute value:", "属性值无效："),

    # ─── 表单验证 - 导入数据集 ────────────────────────────────────
    ("Please select a format first", "请先选择格式"),

    # ─── 表单标签 ──────────────────────────────────────────────────
    ("Chunk size", "分块大小"),
    ("Consensus Replicas", "共识副本数"),
    ("Total honeypots", "蜜罐总数"),
    ("Overhead per job", "每作业开销"),
    ("Short name", "简称"),
    ("First Name", "名"),
    ("Last Name", "姓"),
    ("Token Name", "令牌名称"),
    ("Expiration Date", "过期日期"),
    ("Access key ID", "访问密钥 ID"),
    ("Secret access key", "秘密访问密钥"),
    ("Connection string", "连接字符串"),
    ("Authentication type", "认证类型"),
    ("Container name", "容器名称"),
    ("Export format", "导出格式"),
    ("File name", "文件名"),
    ("Import format", "导入格式"),
    ("Stage and state", "阶段和状态"),
    ("Job type", "作业类型"),
    ("Seed", "种子"),
    ("Target metric", "目标指标"),
    ("Target metric threshold", "目标指标阈值"),
    ("Job selection filter", "作业选择筛选"),
    ("Max validations per job", "每作业最大验证数"),
    ("Min overlap threshold", "最小重叠阈值"),
    ("Low overlap threshold", "低重叠阈值"),
    ("OKS sigma", "OKS sigma"),
    ("Point size base", "点大小基数"),
    ("Relative thickness", "相对粗细"),
    ("Min similarity gain", "最小相似度增益"),
    ("Min group match threshold", "最小组匹配阈值"),
    ("Min visibility threshold", "最小可见度阈值"),
    ("Min Overlap", "最小重叠"),
    ("Consensus score", "共识分数"),
    ("Number of votes", "投票数"),
    ("Export job dataset", "导出作业数据集"),
    ("Lexicographical", "字典序"),
    ("Natural", "自然"),
    ("Select data source", "选择数据源"),

    # ─── 工具提示 ──────────────────────────────────────────────────
    ("Making a server request", "正在发送服务器请求"),
    ("Shift + Double click", "Shift + 双击"),
    ("Cut the shape into two parts", "将形状切成两部分"),
    ("Reduce the number of polygon points", "减少多边形顶点数"),
    ("propagateShortcut", "传播快捷键"),
    ("toBackgroundShortcut", "移至底层快捷键"),
    ("toForegroundShortcut", "移至顶层快捷键"),
    ("toOneLayerBackwardShortcut", "下移一层快捷键"),
    ("toOneLayerForwardShortcut", "上移一层快捷键"),
    ("changeColorShortcut", "更改颜色快捷键"),
    ("removeShortcut", "删除快捷键"),
    ("runAnnotationsActionShortcut", "运行标注操作快捷键"),
    ("Find the previous frame with issues", "查找上一帧的问题"),
    ("Find the next frame with issues", "查找下一帧的问题"),
    ("Show/hide all issues", "显示/隐藏所有问题"),
    ("Show/hide resolved issues", "显示/隐藏已解决的问题"),
    ("Show Ground truth annotations and conflicts", "显示真值标注和冲突"),
    ("Go to previous keyframe", "转到上一关键帧"),
    ("Go to next keyframe", "转到下一关键帧"),
    ("Switch lock property", "切换锁定属性"),
    ("Switch occluded property", "切换遮挡属性"),
    ("Switch pinned property", "切换固定属性"),
    ("Switch hidden property", "切换隐藏属性"),
    ("Switch outside property", "切换超出范围属性"),
    ("Switch keyframe property", "切换关键帧属性"),
    ("Switch lock property for all", "切换所有对象的锁定属性"),
    ("Switch hidden property for all", "切换所有对象的隐藏属性"),
    ("Expand/collapse all", "展开/折叠全部"),
    ("Defines images compression level", "定义图像压缩级别"),
    ("Defines a number of intersected frames between different segments",
     "定义不同分段之间交叉帧的数量"),
    ("Defines a number of frames in a segment", "定义分段中的帧数"),
    ("ZIP chunks have better quality, but they require more disk space and time to download. Relevant for video only",
     "ZIP 分块质量更好，但需要更多磁盘空间和下载时间。仅适用于视频"),
    ("Using cache to store data.", "使用缓存存储数据。"),
    ("Copy data into CVAT", "将数据复制到 CVAT"),
    ("Prefer zip chunks", "优先使用 ZIP 分块"),
    ("The tracker will be applied to drawn rectangles", "跟踪器将应用于绘制的矩形"),
    ("Change current label", "更改当前标签"),
    ("Press to add a tag again", "按此再次添加标签"),
    ("Draw a mask", "绘制掩码"),
    ("Rotate the image anticlockwise", "逆时针旋转图像"),
    ("Rotate the image clockwise", "顺时针旋转图像"),
    ("Rotate the image", "旋转图像"),
    ("Press to draw again", "按此再次绘制"),
    ("Move the image", "移动图像"),
    ("Draw a skeleton", "绘制骨架"),
    ("Create a tag", "创建标签"),
    ("Draw a rectangle", "绘制矩形"),
    ("Draw a cuboid", "绘制长方体"),
    ("Draw points", "绘制点"),
    ("Slice a mask/polygon shape", "切片掩码/多边形形状"),
    ("Fit the image", "适应图像"),
    ("Draw a polygon", "绘制多边形"),
    ("Cancel automatic annotation", "取消自动标注"),
    ("Search for a shortcut here", "搜索快捷键"),
    ("Restore Defaults", "恢复默认"),
    ("Shortcut may consist of any combination of modifiers",
     "快捷键可由任意修饰键组合"),
    ("Snap tools", "吸附工具"),
    ("Waiting for a server response", "等待服务器响应"),

    # ─── 空状态/未找到消息 ──────────────────────────────────────
    ("Sorry, but this job was not found", "抱歉，未找到该作业"),
    ("Please, be sure information you tried to get exist and you have access",
     "请确保您尝试获取的信息存在且您有访问权限"),
    ("There was something wrong during getting the task", "获取任务时出现问题"),
    ("There was something wrong during getting the project", "获取项目时出现问题"),
    ("Sorry, but the requested cloud storage was not found", "抱歉，未找到请求的云存储"),
    ("Please, be sure id you requested exists and you have appropriate permissions",
     "请确保您请求的 ID 存在且您有相应权限"),
    ("Return to Previous Page", "返回上一页"),
    ("No results matched your search", "没有匹配您搜索的结果"),
    ("No projects created yet", "暂无项目"),
    ("No cloud storages attached yet", "暂无云存储"),
    ("To get started with your cloud storage", "开始使用您的云存储"),
    ("You are not in an organization", "您不在任何组织中"),
    ("You do not have active invitations", "您没有活跃的邀请"),
    ("No requests made yet", "暂无请求"),
    ("Start importing/exporting your resources to see progress here",
     "开始导入/导出资源以在此处查看进度"),
    ("Labels not found in the specified model", "在指定模型中未找到标签"),
    ("No comments found", "暂无评论"),
    ("the first one for editing annotation.", "第一个用于编辑标注。"),
    ("No available trackers found", "未找到可用的跟踪器"),
    ("No shapes to display", "没有可显示的形状"),

    # ─── 错误边界/全局错误 ──────────────────────────────────────
    ("Oops, something went wrong", "糟糕，出了点问题"),
    ("More likely there are some issues with the tool", "可能是工具出现了一些问题"),
    ("What has happened?", "发生了什么？"),
    ("Program error has just occurred", "程序错误刚刚发生"),
    ("Exception details", "异常详情"),
    ("What should I do?", "我该怎么办？"),
    ("Please, provide also:", "请同时提供："),
    ("Full error message above", "上方的完整错误信息"),
    ("Steps to reproduce the issue", "重现问题的步骤"),
    ("Your operating system and browser version", "您的操作系统和浏览器版本"),
    ("CVAT version", "CVAT 版本"),

    # ─── CVAT App 消息 ──────────────────────────────────────────
    ("Unsupported platform detected", "检测到不支持的平台"),
    ("The browser you are using is", "您使用的浏览器是"),
    ("based on", "基于"),
    ("CVAT was tested in the latest versions of Chrome and Firefox. We recommend to use Chrome (or another Chromium based browser)",
     "CVAT 已在最新版本的 Chrome 和 Firefox 中测试。我们建议使用 Chrome（或其他基于 Chromium 的浏览器）"),
    ("The operating system is", "操作系统为"),
    ("Unsupported features detected", "检测到不支持的功能"),
    ("does not support API, which is used by CVAT.", "不支持 CVAT 使用的 API。"),
    ("It is strongly recommended to update your browser.", "强烈建议更新您的浏览器。"),

    # ─── 邮箱确认页 ──────────────────────────────────────────────
    ("Please, confirm your email", "请确认您的邮箱"),
    ("Go to login page", "前往登录页"),
    ("This e-mail confirmation link expired or is invalid.",
     "此邮箱确认链接已过期或无效。"),
    ("Please issue a new e-mail confirmation request.", "请重新发送邮箱确认请求。"),

    # ─── 个人资料页 ──────────────────────────────────────────────
    ("Personal Information", "个人信息"),
    ("Your token is ready", "您的令牌已就绪"),

    # ─── 组织页 ──────────────────────────────────────────────────
    ("Invite CVAT users to collaborate", "邀请 CVAT 用户协作"),
    ("If the email address is registered on CVAT, the user will be added to the organization",
     "如果邮箱已在 CVAT 注册，该用户将被添加到组织"),
    ("Enter an email address", "输入邮箱地址"),
    ("Remove organization", "删除组织"),
    ("Add phone number", "添加电话号码"),
    ("Add email", "添加邮箱"),
    ("Add location", "添加地址"),
    ("Invitation pending", "邀请待处理"),

    # ─── 邀请页 ──────────────────────────────────────────────────
    ("has invited you to join the", "邀请您加入"),
    ("organization", "组织"),
    ("Expired", "已过期"),

    # ─── 请求页 ──────────────────────────────────────────────────
    ("Started by", "发起者"),
    ("Expires on", "过期时间"),
    ("Lightweight backup", "轻量备份"),

    # ─── 标注保存提示 ──────────────────────────────────────────
    ("CVAT is saving your annotations, please wait", "CVAT 正在保存您的标注，请稍候"),

    # ─── 批量进度 ──────────────────────────────────────────────
    ("Some items failed to process. You can retry the operation for the remaining",
     "部分项目处理失败。您可以重试剩余操作"),
    ("Failed files", "失败的文件"),
    ("Retry failed tasks", "重试失败的任务"),

    # ─── 重置密码 ──────────────────────────────────────────────
    ("We will send link to your email", "我们将发送链接到您的邮箱"),

    # ─── 文件管理/远程浏览器 ──────────────────────────────────────
    ("Please, be sure you had", "请确保您已"),
    ("mounted", "挂载"),
    ("share before you built CVAT and the shared storage contains files",
     "在构建 CVAT 前共享，且共享存储包含文件"),
    ("Default prefix is used", "使用默认前缀"),
    ("Search by prefix", "按前缀搜索"),

    # ─── 标签表单/属性 ──────────────────────────────────────────
    ("An HTML element representing the attribute", "表示该属性的 HTML 元素"),
    ("Press enter to add a new value", "按回车添加新值"),
    ("This value is default", "此值为默认值"),
    ("Click to set default value", "点击设置默认值"),
    ("Specify a default value", "指定默认值"),
    ("Can this attribute be changed frame to frame?", "此属性是否可以逐帧更改？"),
    ("Delete the attribute", "删除该属性"),

    # ─── MD 指南 ────────────────────────────────────────────────
    ("description", "描述"),

    # ─── 标注操作模态框 ────────────────────────────────────────
    ("Selected action will be applied to the current object", "所选操作将应用于当前对象"),
    ("Actions allow executing certain algorithms on", "操作允许对"),
    ("annotations.", "标注执行特定算法。"),
    ("Select action", "选择操作"),
    ("filtered", "已筛选"),

    # ─── 播放器设置 ──────────────────────────────────────────────
    ("Show deleted frames", "显示已删除的帧"),
    ("You will be able to navigate and restore deleted frames", "您将能够导航和恢复已删除的帧"),

    # ─── 问题对话框 ──────────────────────────────────────────────
    ("Reopen", "重新打开"),
    ("Resolve", "解决"),
    ("Collapse the chat", "折叠聊天"),
    ("Type a comment here", "在此输入评论"),

    # ─── 更新关联云存储 ──────────────────────────────────────────
    ("Please choose how you would like the transfer to be done.",
     "请选择您希望的传输方式。"),

    # ─── AI 工具标签 ──────────────────────────────────────────────
    ("AI Tools", "AI 工具"),
    ("Interactors", "交互器"),
    ("Detectors", "检测器"),
    ("Trackers", "跟踪器"),

    # ─── 杂项 ────────────────────────────────────────────────────
    ("Uploading the file", "正在上传文件"),
    ("As a result of removing the underlying pixels, some masks became empty and were subsequently deleted.",
     "由于移除了底层像素，部分掩码变空并被删除。"),
    ("Make a copy", "创建副本"),
    ("Slice", "切片"),
    ("Simplify", "简化"),
    ("Switch orientation", "切换方向"),
    ("Active list of shortcuts", "快捷键活动列表"),
    ("To remove the organization, enter its short name below",
     "要删除组织，请在下方输入其简称"),
    ("Unsupported platform detected", "检测到不支持的平台"),
    ("Loading...", "加载中..."),

    # ─── 填充短语/半句（补充） ──────────────────────────────────
    ("Please, specify a direction", "请指定方向"),
    ("How many copies do you want to create?", "要创建多少个副本？"),
    ("Or specify a range where copies will be created", "或指定创建副本的范围"),
    ("Issue", "问题"),
    ("Server:", "服务器："),
    ("UI:", "界面："),
    ("Provider:", "服务商："),
    ("Status:", "状态："),
    ("by", "由"),
    ("on", "于"),
]


# ============================================================
# 辅助函数（与 translate_ui.py 相同逻辑）
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
        # 1. 双引号字符串完整内容
        new, n = re.subn(r'"' + en_esc + r'"', f'"{zh}"', content)
        if n:
            content, total = new, total + n

        # 2. 单引号字符串完整内容
        new, n = re.subn(r"'" + en_esc + r"'", f"'{zh}'", content)
        if n:
            content, total = new, total + n

        # 3. JSX 内联文本：> Text < 或 > Text\n
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

        # 5. 模板字符串中的文本（`...` 内）
        new, n = re.subn(r'`' + en_esc + r'`', f'`{zh}`', content)
        if n:
            content, total = new, total + n

        # 6. 反引号模板字符串中的 ${...} 前后文本
        #    处理 `Prefix text ${variable} suffix text` 模式
        #    这个模式比较复杂，先用简单替换处理

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

    print(f'{"[预览] " if args.dry_run else ""}第二阶段汉化 {src}')
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
