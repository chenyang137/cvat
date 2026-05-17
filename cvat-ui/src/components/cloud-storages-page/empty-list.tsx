// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import Empty from 'antd/lib/empty';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import { CloudOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface Props {
    notFound: boolean;
}

export default function EmptyListComponent(props: Props): JSX.Element {
    const { notFound } = props;

    return (
        <div className='cvat-empty-cloud-storages-list'>
            <Empty
                description={notFound ? (
                    <Text strong>没有找到匹配的结果...</Text>
                ) : (
                    <>
                        <Row justify='center' align='middle'>
                            <Col>
                                <Text strong>还没有添加云存储...</Text>
                            </Col>
                        </Row>
                        <Row justify='center' align='middle'>
                            <Col>
                                <Text type='secondary'>开始使用您的云存储</Text>
                            </Col>
                        </Row>
                        <Row justify='center' align='middle'>
                            <Col>
                                <Link to='/cloudstorages/create'>添加新云存储</Link>
                            </Col>
                        </Row>
                    </>
                )}
                image={notFound ? Empty.PRESENTED_IMAGE_DEFAULT : <CloudOutlined className='cvat-empty-cloud-storages-list-icon' />}
            />
        </div>
    );
}
