// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Select from 'antd/lib/select';
import { JobStage, JobState } from 'cvat-core-wrapper';
import { handleDropdownKeyDown } from 'utils/dropdown-utils';

interface JobStateSelectorProps {
    value: JobState | null;
    onSelect: (newValue: JobState) => void;
}

export function JobStateSelector({ value, onSelect }: Readonly<JobStateSelectorProps>): JSX.Element {
    const stateLabels: Record<string, string> = {
        [JobState.NEW]: '新建',
        [JobState.IN_PROGRESS]: '进行中',
        [JobState.REJECTED]: '已拒绝',
        [JobState.COMPLETED]: '已完成',
    };
    return (
        <Select
            className='cvat-job-item-state'
            popupClassName='cvat-job-item-state-dropdown'
            value={value}
            onChange={onSelect}
            onKeyDown={handleDropdownKeyDown}
            placeholder='选择状态'
        >
            <Select.Option value={JobState.NEW}>{stateLabels[JobState.NEW]}</Select.Option>
            <Select.Option value={JobState.IN_PROGRESS}>{stateLabels[JobState.IN_PROGRESS]}</Select.Option>
            <Select.Option value={JobState.REJECTED}>{stateLabels[JobState.REJECTED]}</Select.Option>
            <Select.Option value={JobState.COMPLETED}>{stateLabels[JobState.COMPLETED]}</Select.Option>
        </Select>
    );
}

interface JobStageSelectorProps {
    value: JobStage | null;
    onSelect: (newValue: JobStage) => void;
}

export function JobStageSelector({ value, onSelect }: Readonly<JobStageSelectorProps>): JSX.Element {
    const stageLabels: Record<string, string> = {
        [JobStage.ANNOTATION]: '标注',
        [JobStage.VALIDATION]: '审核',
        [JobStage.ACCEPTANCE]: '验收',
    };
    return (
        <Select
            className='cvat-job-item-stage'
            popupClassName='cvat-job-item-stage-dropdown'
            value={value}
            onChange={onSelect}
            onKeyDown={handleDropdownKeyDown}
            placeholder='选择阶段'
        >
            <Select.Option value={JobStage.ANNOTATION}>
                {stageLabels[JobStage.ANNOTATION]}
            </Select.Option>
            <Select.Option value={JobStage.VALIDATION}>
                {stageLabels[JobStage.VALIDATION]}
            </Select.Option>
            <Select.Option value={JobStage.ACCEPTANCE}>
                {stageLabels[JobStage.ACCEPTANCE]}
            </Select.Option>
        </Select>
    );
}
