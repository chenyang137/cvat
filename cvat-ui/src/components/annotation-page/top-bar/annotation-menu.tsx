// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import Modal from 'antd/lib/modal';
import Text from 'antd/lib/typography/Text';
import InputNumber from 'antd/lib/input-number';
import Checkbox from 'antd/lib/checkbox';
import Collapse from 'antd/lib/collapse';
import Dropdown from 'antd/lib/dropdown';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';
import Icon from '@ant-design/icons';
import { MenuProps } from 'antd/lib/menu';

import { MainMenuIcon } from 'icons';
import { Job, JobState } from 'cvat-core-wrapper';
import { usePlugins } from 'utils/hooks';

import CVATTooltip from 'components/common/cvat-tooltip';
import { openAnnotationsActionModal } from 'components/annotation-page/annotations-actions/annotations-actions-modal';
import { CombinedState } from 'reducers';
import {
    finishCurrentJobAsync,
    removeAnnotationsAsync as removeAnnotationsAsyncAction,
} from 'actions/annotation-actions';
import { exportActions } from 'actions/export-actions';
import { importActions } from 'actions/import-actions';
import { updateJobAsync } from 'actions/jobs-actions';

export enum Actions {
    LOAD_JOB_ANNO = 'load_job_anno',
    EXPORT_JOB_DATASET = 'export_job_dataset',
    REMOVE_ANNOTATIONS = 'remove_annotations',
    RUN_ACTIONS = 'run_actions',
    OPEN_TASK = 'open_task',
    FINISH_JOB = 'finish_job',
}

function AnnotationMenuComponent(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();
    const jobInstance = useSelector((state: CombinedState) => state.annotation.job.instance as Job);
    const [jobState, setJobState] = useState(jobInstance.state);
    const pluginActions = usePlugins(
        (state: CombinedState) => state.plugins.components.annotationPage.menuActions.items,
        { jobInstance },
    );
    const { stopFrame } = jobInstance;

    useEffect(() => {
        setJobState(jobInstance.state);
    }, [jobInstance.state]);

    const exportDataset = useCallback(() => {
        dispatch(exportActions.openExportDatasetModal(jobInstance));
    }, [jobInstance]);

    const finishJob = useCallback(() => {
        dispatch(finishCurrentJobAsync(() => {
            message.open({
                duration: 1,
                type: 'success',
                content: '您已将作业标记为已完成',
                className: 'cvat-annotation-job-finished-success',
            });
        }));
    }, []);

    const openTask = useCallback(() => {
        history.push(`/tasks/${jobInstance.taskId}`);
    }, [jobInstance.taskId]);

    const uploadAnnotations = useCallback(() => {
        dispatch(importActions.openImportDatasetModal(jobInstance));
    }, [jobInstance]);

    const changeState = useCallback((state: JobState) => {
        dispatch(updateJobAsync(jobInstance, { state })).then(() => {
            message.info('作业状态已更新', 2);
        });
    }, [jobInstance]);

    const changeJobState = useCallback((state: JobState) => () => {
        Modal.confirm({
            title: '确定要更新当前作业状态吗？',
            content: `作业状态将切换为"${state}"`,
            okText: '继续',
            cancelText: '取消',
            className: 'cvat-modal-content-change-job-state',
            onOk: () => changeState(state),
        });
    }, [changeState]);

    const computeClassName = (menuItemState: string): string => {
        if (menuItemState === jobState) return 'cvat-submenu-current-job-state-item';
        return '';
    };

    const menuItems: [NonNullable<MenuProps['items']>[0], number][] = [];

    menuItems.push([{
        key: Actions.LOAD_JOB_ANNO,
        label: '上传标注',
        onClick: uploadAnnotations,
    }, 10]);

    menuItems.push([{
        key: Actions.EXPORT_JOB_DATASET,
        label: '导出作业数据集',
        onClick: exportDataset,
    }, 20]);

    menuItems.push([{
        key: Actions.REMOVE_ANNOTATIONS,
        label: '删除标注',
        onClick: () => {
            let removeFrom: number | undefined;
            let removeUpTo: number | undefined;
            let removeOnlyKeyframes = false;
            Modal.confirm({
                title: '删除标注',
                content: (
                    <div>
                        <Text>您将删除每一帧的所有标注。 </Text>
                        <Text>如果只想删除特定帧的标注，请在下方选择范围。</Text>
                        <Text>更改仅在保存作业后生效。</Text>
                        <br />
                        <br />
                        <br />
                        <Collapse
                            bordered={false}
                            items={[{
                                key: 1,
                                label: <Text>选择范围</Text>,
                                children: (
                                    <>
                                        <Text>From: </Text>
                                        <InputNumber
                                            min={0}
                                            max={stopFrame}
                                            onChange={(value) => {
                                                removeFrom = value ?? undefined;
                                            }}
                                        />
                                        <Text>  To: </Text>
                                        <InputNumber
                                            min={0}
                                            max={stopFrame}
                                            onChange={(value) => {
                                                removeUpTo = value ?? undefined;
                                            }}
                                        />
                                        <CVATTooltip title='仅适用于范围内的标注'>
                                            <br />
                                            <br />
                                            <Checkbox
                                                onChange={(check) => {
                                                    removeOnlyKeyframes = check.target.checked;
                                                }}
                                            >
                                                Delete only keyframes for tracks
                                            </Checkbox>
                                        </CVATTooltip>
                                    </>
                                ),
                            }]}
                        />
                    </div>
                ),
                className: 'cvat-modal-confirm-remove-annotation',
                onOk: () => {
                    dispatch(removeAnnotationsAsyncAction(removeFrom, removeUpTo, removeOnlyKeyframes));
                },
                okButtonProps: {
                    type: 'primary',
                    danger: true,
                },
                okText: '移除',
            });
        },
    }, 30]);

    menuItems.push([{
        key: Actions.RUN_ACTIONS,
        label: '运行操作',
        onClick: () => {
            openAnnotationsActionModal();
        },
    }, 40]);

    menuItems.push([{
        key: Actions.OPEN_TASK,
        label: '打开任务',
        onClick: openTask,
    }, 50]);

    menuItems.push([{
        key: 'job-state-submenu',
        popupClassName: 'cvat-annotation-menu-job-state-submenu',
        label: '更改作业状态',
        children: [{
            key: `state:${JobState.NEW}`,
            label: '新建',
            className: computeClassName(JobState.NEW),
            onClick: changeJobState(JobState.NEW),
        }, {
            key: `state:${JobState.IN_PROGRESS}`,
            label: '进行中',
            className: computeClassName(JobState.IN_PROGRESS),
            onClick: changeJobState(JobState.IN_PROGRESS),
        }, {
            key: `state:${JobState.REJECTED}`,
            label: '已拒绝',
            className: computeClassName(JobState.REJECTED),
            onClick: changeJobState(JobState.REJECTED),
        }, {
            key: `state:${JobState.COMPLETED}`,
            label: '已完成',
            className: computeClassName(JobState.COMPLETED),
            onClick: changeJobState(JobState.COMPLETED),
        }],
    }, 60]);

    menuItems.push([{
        key: Actions.FINISH_JOB,
        label: '完成作业',
        onClick: () => {
            Modal.confirm({
                title: '确定要完成该作业吗？',
                content: '这将保存标注并将作业状态设置为"已完成"',
                okText: '继续',
                cancelText: '取消',
                className: 'cvat-modal-content-finish-job',
                onOk: finishJob,
            });
        },
    }, 70]);

    menuItems.push(
        ...pluginActions.map(({ component: Component, weight }, index) => {
            const menuItem = Component({ key: index, targetProps: { jobInstance } });
            return [menuItem, weight] as [NonNullable<MenuProps['items']>[0], number];
        }),
    );

    const sortedMenuItems = [...menuItems].sort((menuItem1, menuItem2) => menuItem1[1] - menuItem2[1]);
    const finalMenuItems = sortedMenuItems.map((menuItem) => menuItem[0]);

    return (
        <Dropdown
            trigger={['click']}
            destroyPopupOnHide
            menu={{
                items: finalMenuItems,
                triggerSubMenuAction: 'click',
                className: 'cvat-annotation-menu',
            }}
        >
            <Button type='link' className='cvat-annotation-header-menu-button cvat-annotation-header-button'>
                <Icon component={MainMenuIcon} />
                Menu
            </Button>
        </Dropdown>
    );
}

export default React.memo(AnnotationMenuComponent);
