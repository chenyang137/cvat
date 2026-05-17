// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { TasksQuery } from 'reducers';
import { CSVColumn } from 'utils/csv-writer';
import { getCore, Task } from 'cvat-core-wrapper';
import createCSVExportButton from '../export-csv-button-hoc';

const cvat = getCore();

const columns: CSVColumn<Task>[] = [
    { header: 'ID', accessor: (task) => task.id },
    { header: '名称', accessor: (task) => task.name },
    { header: '任务 URL', accessor: (task) => `${window.location.origin}/tasks/${task.id}` },
    { header: '项目 ID', accessor: (task) => task.projectId },
    { header: '项目名称', accessor: (task) => task.projectName ?? '' },
    { header: '项目 URL', accessor: (task) => (task.projectId ? `${window.location.origin}/projects/${task.projectId}` : '') },
    { header: '拥有者', accessor: (task) => task.owner?.username ?? '' },
    { header: '被指派人', accessor: (task) => task.assignee?.username ?? '' },
    { header: '状态', accessor: (task) => task.status },
    { header: '模式', accessor: (task) => task.mode },
    { header: '大小', accessor: (task) => task.size },
    { header: '子集', accessor: (task) => task.subset ?? '' },
    {
        header: '创建日期',
        accessor: (task) => task.createdDate,
    },
    {
        header: '更新日期',
        accessor: (task) => task.updatedDate,
    },
    { header: '缺陷追踪器', accessor: (task) => task.bugTracker ?? '' },
];

const TasksCSVExportButton = createCSVExportButton<Task, TasksQuery>({
    resourceName: 'tasks',
    className: 'cvat-tasks-export-csv-button',
    tooltipTitle: '将任务导出为CSV',
    columns,
    uniqueKey: 'id',
    fetchPage: async (query) => {
        const tasks = await cvat.tasks.get(query);
        return {
            results: tasks,
            count: tasks.count,
        };
    },
});

export default TasksCSVExportButton;
