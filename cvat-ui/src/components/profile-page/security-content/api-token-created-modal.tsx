// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useState, useCallback, useEffect } from 'react';

import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import Typography from 'antd/lib/typography';
import Space from 'antd/lib/space';
import { CopyOutlined } from '@ant-design/icons';

import { ApiToken } from 'cvat-core-wrapper';
import { toClipboard } from 'utils/to-clipboard';

interface Props {
    visible: boolean;
    token: ApiToken;
    onClose: () => void;
}

function ApiTokenCreatedModal({
    visible, token, onClose,
}: Props): JSX.Element {
    const [copied, setCopied] = useState(false);
    const { value: tokenValue } = token;

    useEffect(() => {
        if (visible) {
            setCopied(false);
        }
    }, [visible]);

    const handleCopyToClipboard = useCallback(async (): Promise<void> => {
        toClipboard(tokenValue ?? '').then(setCopied);
    }, [tokenValue]);

    return (
        <Modal
            title='您的令牌已准备就绪'
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key='close' type='primary' onClick={onClose} style={{ background: '#faad14' }}>
                    我已经&nbsp;
                    <strong>安全地</strong>
                    &nbsp;保存了我的令牌
                </Button>,
            ]}
            width={500}
            className='cvat-api-token-created-modal'
            maskClosable={false}
        >
            <Space direction='vertical' size='large' style={{ width: '100%' }}>
                <div className='cvat-api-token-created-modal-content'>
                    <Typography.Text type='secondary'>
                        请确保现在复制您的新个人访问令牌。
                        <br />
                        您将无法再次查看它！
                    </Typography.Text>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            value={token.value}
                            readOnly
                            style={{ flex: 1 }}
                            className='cvat-api-token-value-input'
                        />
                        <Button
                            type='default'
                            icon={<CopyOutlined />}
                            onClick={handleCopyToClipboard}
                            className='cvat-api-token-copy-button'
                        >
                            {copied ? '已复制！' : '复制'}
                        </Button>
                    </Space.Compact>
                </div>
            </Space>
        </Modal>
    );
}

export default React.memo(ApiTokenCreatedModal);
