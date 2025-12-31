// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import Text from 'antd/lib/typography/Text';
import Empty from 'antd/lib/empty';

function EmptyListComponent(): JSX.Element {
    return (
        <div className='cvat-empty-members-list'>
            <Empty description={<Text strong>没有符合搜索条件的结果...</Text>} />
        </div>
    );
}

export default React.memo(EmptyListComponent);
