// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import Modal from 'antd/lib/modal';

import { Organization, Project, Task } from 'cvat-core-wrapper';

export function confirmTransferModal(
    instances: Project[] | Task[],
    activeWorkspace: Organization | null,
    dstWorkspace: Organization | null,
    onOk: () => void,
): void {
    const first = instances[0];
    if (!first) {
        return;
    }

    const instanceType = first instanceof Task ? '任务' : '项目';
    const movingItems = instances.length > 1 ?
        `${instances.length} 个${instanceType}` : `${instanceType} #${first.id}`;
    let details = `您将移动 ${movingItems} ` +
        `到${dstWorkspace ? `组织 ${dstWorkspace.slug}` : '个人工作区'}。`;
    if (activeWorkspace) {
        details += '组织成员将失去对' +
            `${instances.length > 1 ? '这些资源' : '此资源'}的访问权限。`;
    }

    Modal.confirm({
        title: '工作区之间的数据传输',
        content: `${details} 是否继续？`,
        className: 'cvat-modal-confirm-project-transfer-between-workspaces',
        onOk,
        okButtonProps: {
            type: 'primary',
            danger: true,
        },
        okText: '继续',
    });
}
