// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Text from 'antd/lib/typography/Text';
import { BaseType } from 'antd/es/typography/Base';
import LoadingOutlined from '@ant-design/icons/lib/icons/LoadingOutlined';
import { RQStatus } from 'cvat-core-wrapper';

function statusMessage(message: string, defaultMessage: string, postfix?: JSX.Element): JSX.Element {
    if (message) {
        return (
            <>
                {message}
                {postfix || null}
            </>
        );
    }

    return (
        <>
            {defaultMessage}
            {postfix || null}
        </>
    );
}

export interface Props {
    status: RQStatus | null;
    message: string | null;
    cancelled: boolean;
}

function StatusMessage(props: Props): JSX.Element {
    const { cancelled } = props;
    let { status, message } = props;
    message = message || '';
    status = status || RQStatus.FINISHED;

    const [textType, classHelper] = ((_status: RQStatus) => {
        if (cancelled) {
            return [undefined, 'cancelled'];
        }

        if (_status === RQStatus.FINISHED) {
            return ['success', 'success'];
        }

        if (_status === RQStatus.QUEUED) {
            return ['warning', 'queued'];
        }

        if (_status === RQStatus.STARTED) {
            return [undefined, 'started'];
        }

        return ['danger', 'failed'];
    })(status);

    return (
        <Text
            className={`cvat-request-item-progress-message cvat-request-item-progress-${classHelper}`}
            type={textType as BaseType | undefined}
            strong
        >
            {((): JSX.Element => {
                if (cancelled) {
                    return statusMessage(message, '已取消');
                }

                if (status === RQStatus.FINISHED) {
                    return statusMessage(message, '已完成');
                }

                if ([RQStatus.QUEUED].includes(status)) {
                    return statusMessage(message, '队列中', <LoadingOutlined />);
                }

                if ([RQStatus.STARTED].includes(status)) {
                    return statusMessage(message, '进行中', <LoadingOutlined />);
                }

                if (status === RQStatus.FAILED) {
                    return statusMessage(message, '失败');
                }

                if (status === RQStatus.UNKNOWN) {
                    return statusMessage(message, '收到未知状态');
                }

                return statusMessage(message, '收到未知状态');
            })()}
        </Text>
    );
}

export default React.memo(StatusMessage);
