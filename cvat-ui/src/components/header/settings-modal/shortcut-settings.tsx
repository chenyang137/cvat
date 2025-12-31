// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import {
    Button,
    Col,
    Flex,
    Row,
    Collapse,
    List,
    Alert,
} from 'antd/lib';
import Search from 'antd/lib/input/Search';
import Empty from 'antd/lib/empty';
import Modal from 'antd/lib/modal';
import React, {
    useState, useMemo,
    useCallback,
} from 'react';
import { ShortcutScope } from 'utils/enums';
import { KeyMap } from 'utils/mousetrap-react';
import { shortcutsActions } from 'actions/shortcuts-actions';
import { useDispatch, useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
import MultipleShortcutsDisplay from './multiple-shortcuts-display';

interface Props {
    keyMap: KeyMap;
    onKeySequenceUpdate(shortcutID: string, updatedSequence: string[]): void;
}

function ShortcutsSettingsComponent(props: Props): JSX.Element {
    const { keyMap, onKeySequenceUpdate } = props;
    const [searchValue, setSearchValue] = useState('');
    const shortcuts = useSelector((state: CombinedState) => state.shortcuts);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const dispatch = useDispatch();

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchValue(event.target.value.toLowerCase());
    };

    const onRestoreDefaults = useCallback(() => {
        Modal.confirm({
            title: '确定要恢复默认设置吗？',
            okText: '是',
            className: 'cvat-shortcuts-settings-restore-modal',
            cancelText: '否',
            onOk: () => {
                const currentSettings = localStorage.getItem('clientSettings');
                dispatch(shortcutsActions.registerShortcuts({ ...shortcuts.defaultState }));
                if (currentSettings) {
                    try {
                        const parsedSettings = JSON.parse(currentSettings);
                        delete parsedSettings.shortcuts;
                        localStorage.setItem('clientSettings', JSON.stringify(parsedSettings));
                    } catch (error) {
                        localStorage.removeItem('clientSettings');
                    }
                }
            },
        });
    }, [shortcuts.defaultState]);

    const filteredKeyMap = useMemo(() => Object.entries(keyMap).filter(
        ([, item]) => (
            item.name.toLowerCase().includes(searchValue) ||
            item.description.toLowerCase().includes(searchValue)
        ),
    ), [keyMap, searchValue]);

    const items: any = useMemo(() => {
        const scopeItems = Object.values(ShortcutScope).map((scope: string) => {
            const viewFilteredItems = filteredKeyMap.filter(
                ([, item]) => item.scope === scope,
            ).sort(([, item1], [, item2]) => (item1.displayWeight ?? 0) - (item2.displayWeight ?? 0));
            if (viewFilteredItems.length === 0) {
                return null;
            }

            let scopeTitle = scope.split('_').join(' ');
            const firstAlphaIndex = scopeTitle.search(/[a-zA-Z]/);
            if (firstAlphaIndex !== -1) {
                scopeTitle = scopeTitle.slice(0, firstAlphaIndex) +
                scopeTitle.charAt(firstAlphaIndex).toUpperCase() +
                scopeTitle.slice(firstAlphaIndex + 1).toLowerCase();
            }
            return {
                label: <span className='cvat-shortcuts-settings-label'>{scopeTitle}</span>,
                key: scope,
                showArrow: !searchValue,
                children: (
                    <List
                        dataSource={viewFilteredItems}
                        renderItem={([id, item]) => (
                            <List.Item
                                className='cvat-shortcuts-settings-collapse-item'
                            >
                                <List.Item.Meta
                                    className={`${item.nonActive ? 'cvat-shortcuts-settings-item-non-active' : ''}`}
                                    title={<p className='cvat-shortcuts-settings-item-title'>{item.name}</p>}
                                    description={<span className='cvat-shortcuts-settings-item-description'>{item.description}</span>}
                                />
                                <MultipleShortcutsDisplay
                                    id={id}
                                    keyMap={keyMap}
                                    item={item}
                                    onKeySequenceUpdate={onKeySequenceUpdate}
                                />
                            </List.Item>
                        )}
                        style={{ paddingLeft: 5 }}
                    />
                ),
            };
        }).filter(Boolean);

        if (scopeItems.length === 0) {
            return null;
        }

        return scopeItems;
    }, [filteredKeyMap]);

    const handleCollapseChange = (keys: string[] | string): void => {
        if (!searchValue) {
            setActiveKeys(Array.isArray(keys) ? keys : [keys]);
        }
    };

    return (
        <div className='cvat-shortcuts-settings'>
            <Row className='cvat-shortcuts-setting'>
                <Col span={24}>
                    <Flex gap={4}>
                        <Search
                            size='large'
                            placeholder='在此搜索快捷键...'
                            allowClear
                            onChange={onSearchChange}
                            className='cvat-shortcuts-settings-search'
                        />
                        <Button size='large' onClick={onRestoreDefaults} className='cvat-shortcuts-settings-restore'>恢复默认设置</Button>
                    </Flex>
                </Col>
            </Row>
            <Row className='cvat-shortcuts-setting'>
                <Col span={24}>
                    <Alert message='快捷键可以由任意组合的修饰键（alt、ctrl或shift）和一个非修饰键组成。某些按键组合可能被浏览器保留，无法在CVAT中覆盖。' type='warning' showIcon />
                    {items ? (
                        <Collapse
                            items={items}
                            bordered={false}
                            activeKey={searchValue ? Object.values(ShortcutScope) : activeKeys}
                            onChange={handleCollapseChange}
                            className='cvat-shortcuts-settings-collapse'
                        />
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default React.memo(ShortcutsSettingsComponent);
