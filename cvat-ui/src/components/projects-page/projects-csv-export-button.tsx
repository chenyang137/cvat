// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import { ProjectsQuery } from 'reducers';
import { CSVColumn } from 'utils/csv-writer';
import { getCore, Project } from 'cvat-core-wrapper';
import createCSVExportButton from '../export-csv-button-hoc';

const cvat = getCore();

const columns: CSVColumn<Project>[] = [
    { header: 'ID', accessor: (project) => project.id },
    { header: '名称', accessor: (project) => project.name },
    { header: '项目 URL', accessor: (project) => `${window.location.origin}/projects/${project.id}` },
    { header: '拥有者', accessor: (project) => project.owner?.username ?? '' },
    { header: '被指派人', accessor: (project) => project.assignee?.username ?? '' },
    { header: '状态', accessor: (project) => project.status },
    { header: '维度', accessor: (project) => project.dimension },
    {
        header: '任务子集',
        accessor: (project) => (
            project.subsets && project.subsets.length > 0 ?
                project.subsets.join(', ') :
                ''
        ),
    },
    {
        header: '创建日期',
        accessor: (project) => project.createdDate,
    },
    {
        header: '更新日期',
        accessor: (project) => project.updatedDate,
    },
    { header: '缺陷追踪器', accessor: (project) => project.bugTracker ?? '' },
];

const ProjectsCSVExportButton = createCSVExportButton<Project, ProjectsQuery>({
    resourceName: 'projects',
    className: 'cvat-projects-export-csv-button',
    tooltipTitle: '将项目导出为CSV',
    columns,
    uniqueKey: 'id',
    fetchPage: async (query) => {
        const projects = await cvat.projects.get(query);
        return {
            results: projects,
            count: projects.count,
        };
    },
});

export default ProjectsCSVExportButton;
