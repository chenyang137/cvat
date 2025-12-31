// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import Alert from 'antd/lib/alert';

import { CombinedState } from 'reducers';
import { Storage, Task } from 'cvat-core-wrapper';
import { cloudStoragesActions } from 'actions/cloud-storage-actions';
import CVATTooltip from 'components/common/cvat-tooltip';

function SelectCSUpdatingSchemeModal(): JSX.Element | null {
    const {
        instances,
        onUpdate,
    } = useSelector((state: CombinedState) => ({
        instances: state.cloudStorages.updateWorkspace.instances,
        onUpdate: state.cloudStorages.updateWorkspace.onUpdate!,
    }), shallowEqual);

    const [instanceType, setInstanceType] = useState('');
    const dispatch = useDispatch();

    const closeModal = () => {
        dispatch(cloudStoragesActions.closeLinkedCloudStorageUpdatingModal());
    };

    useEffect(() => {
        if (instances?.length) {
            setInstanceType(instances[0] instanceof Task ? 'task' : 'project');
        }
    }, [instances]);

    if (!instances) {
        return null;
    }

    const capitalizedInstanceType = instanceType.charAt(0).toUpperCase() + instanceType.slice(1);
    const alert = '数据链接存储只在传输过程中重置，之后必须手动更新';
    const message = instances.length > 1 ?
        '某些资源链接到云存储' :
        `${capitalizedInstanceType} #${instances[0].id} 链接到云存储`;

    return (
        <Modal
            title={(
                <Space>
                    {message}
                    <CVATTooltip
                        title={(
                            <>
                                <div>
                                    <strong>移动并分离</strong>
                                    : 传输并从云存储中取消链接。
                                </div>
                                <div>
                                    <strong>移动并自动匹配</strong>
                                    : 传输并在目标工作区中尝试自动链接类似的云存储。
                                     类似的云存储是通过比较整个云存储配置（凭据和所有者除外）来定义的。
                                </div>
                            </>
                        )}
                    >
                        <QuestionCircleOutlined className='cvat-choose-cloud-storage-change-scheme-help-button' />
                    </CVATTooltip>
                </Space>
            )}
            className='cvat-modal-choose-cloud-storage-change-scheme'
            closable={false}
            open
            footer={[
                <Button key='cancel' onClick={() => closeModal()}>
                    取消
                </Button>,
                <Button
                    key='move_and_detach'
                    type='primary'
                    onClick={() => {
                        instances.forEach((instance) => {
                            if (instance.sourceStorage.isCloudLinked()) {
                                instance.sourceStorage = Storage.buildLocalStorage();
                            }

                            if (instance.targetStorage.isCloudLinked()) {
                                instance.targetStorage = Storage.buildLocalStorage();
                            }
                        });

                        closeModal();
                        onUpdate();
                    }}
                >
                    移动并分离
                </Button>,
                // do not show option "move and auto match" when only data storage is linked
                (
                    instances.some((instance) => (
                        instance.sourceStorage.isCloudLinked() || instance.targetStorage.isCloudLinked()
                    ))
                ) && (
                    <Button
                        key='move_and_auto_match'
                        type='primary'
                        onClick={() => {
                            closeModal();
                            onUpdate();
                        }}
                    >
                        移动并自动匹配
                    </Button>
                ),
            ]}
        >
            {
                (
                    instances.some((instance) => (
                        instance instanceof Task && instance.cloudStorageId &&
                        (instance.sourceStorage.isCloudLinked() || instance.targetStorage.isCloudLinked())
                    ))
                ) && (
                    <Alert
                        message={alert}
                        type='warning'
                    />
                )
            }

            <p>
                请选择您希望如何完成传输。
            </p>
        </Modal>
    );
}

export default React.memo(SelectCSUpdatingSchemeModal);
