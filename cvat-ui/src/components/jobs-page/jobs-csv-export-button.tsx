// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { JobsQuery } from 'reducers';
import { CSVColumn } from 'utils/csv-writer';
import { getCore, Job } from 'cvat-core-wrapper';
import createCSVExportButton from '../export-csv-button-hoc';

const cvat = getCore();

const columns: CSVColumn<Job>[] = [
    { header: 'ID', accessor: (job) => job.id },
    { header: 'Job URL', accessor: (job) => `${window.location.origin}/tasks/${job.taskId}/jobs/${job.id}` },
    { header: '任务 ID', accessor: (job) => job.taskId },
    { header: 'Task Name', accessor: (job) => job.taskName ?? '' },
    { header: '任务 URL', accessor: (job) => `${window.location.origin}/tasks/${job.taskId}` },
    { header: '项目 ID', accessor: (job) => job.projectId },
    { header: '项目名称', accessor: (job) => job.projectName ?? '' },
    { header: '项目 URL', accessor: (job) => (job.projectId ? `${window.location.origin}/projects/${job.projectId}` : '') },
    { header: '被指派人', accessor: (job) => job.assignee?.username ?? '' },
    { header: '阶段', accessor: (job) => job.stage },
    { header: '状态', accessor: (job) => job.state },
    { header: '类型', accessor: (job) => job.type },
    { header: 'Start Frame', accessor: (job) => job.startFrame },
    { header: 'Stop Frame', accessor: (job) => job.stopFrame },
    { header: 'Frame Count', accessor: (job) => job.stopFrame - job.startFrame + 1 },
    {
        header: '创建日期',
        accessor: (job) => job.createdDate,
    },
    {
        header: '更新日期',
        accessor: (job) => job.updatedDate,
    },
];

const JobsCSVExportButton = createCSVExportButton<Job, JobsQuery>({
    resourceName: 'jobs',
    className: 'cvat-jobs-export-csv-button',
    tooltipTitle: 'Export jobs to CSV',
    columns,
    uniqueKey: 'id',
    fetchPage: async (query) => {
        const jobs = await cvat.jobs.get(query);
        return {
            results: jobs,
            count: jobs.count,
        };
    },
});

export default JobsCSVExportButton;
