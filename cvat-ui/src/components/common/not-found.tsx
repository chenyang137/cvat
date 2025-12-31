// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Result from 'antd/lib/result';

export const JobNotFoundComponent = React.memo((): JSX.Element => (
    <Result
        className='cvat-not-found'
        status='404'
        title='抱歉，未找到此任务'
        subTitle='请确保您尝试访问的信息存在且您有访问权限'
    />
));

export const TaskNotFoundComponent = React.memo((): JSX.Element => (
    <Result
        className='cvat-not-found'
        status='404'
        title='获取任务时出错'
        subTitle='请确保您尝试获取的信息存在且您有权访问'
    />
));

export const ProjectNotFoundComponent = React.memo((): JSX.Element => (
    <Result
        className='cvat-not-found'
        status='404'
        title='获取项目时出错'
        subTitle='请确保您尝试获取的信息存在且您有权访问'
    />
));

export const CloudStorageNotFoundComponent = React.memo((): JSX.Element => (
    <Result
        className='cvat-not-found'
        status='404'
        title='抱歉，未找到请求的云存储'
        subTitle='请确保您请求的ID存在且您有相应权限'
    />
));
