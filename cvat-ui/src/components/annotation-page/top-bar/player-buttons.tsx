// Copyright (C) 2020-2024 Intel Corporation
//
// SPDX-License-Identifier: MIT

import React, { CSSProperties } from 'react';
import { Col } from 'antd/lib/grid';
import Icon from '@ant-design/icons';
import Popover from 'antd/lib/popover';

import CVATTooltip from 'components/common/cvat-tooltip';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';
import { NavigationType, Workspace } from 'reducers';
import {
    FirstIcon,
    BackJumpIcon,
    PreviousIcon,
    PreviousFilteredIcon,
    PreviousEmptyIcon,
    PlayIcon,
    PauseIcon,
    NextIcon,
    NextFilteredIcon,
    NextEmptyIcon,
    ForwardJumpIcon,
    LastIcon,
} from 'icons';
import { ShortcutScope } from 'utils/enums';
import { registerComponentShortcuts } from 'actions/shortcuts-actions';
import { subKeyMap } from 'utils/component-subkeymap';

interface Props {
    playing: boolean;
    playPauseShortcut: string;
    nextFrameShortcut: string;
    previousFrameShortcut: string;
    forwardShortcut: string;
    backwardShortcut: string;
    keyMap: KeyMap;
    workspace: Workspace;
    navigationType: NavigationType;
    onSwitchPlay(): void;
    onPrevFrame(): void;
    onNextFrame(): void;
    onForward(): void;
    onBackward(): void;
    onFirstFrame(): void;
    onLastFrame(): void;
    onSearchAnnotations(direction: 'forward' | 'backward'): void;
    setNavigationType(navigationType: NavigationType): void;
}

const componentShortcuts = {
    NEXT_FRAME: {
        name: '下一帧',
        description: '转到下一帧',
        sequences: ['f'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    PREV_FRAME: {
        name: '上一帧',
        description: '转到上一帧',
        sequences: ['d'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    FORWARD_FRAME: {
        name: '前进帧',
        description: '向前跳几步',
        sequences: ['v'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    BACKWARD_FRAME: {
        name: '后退帧',
        description: '向后跳几步',
        sequences: ['c'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    SEARCH_FORWARD: {
        name: '向前搜索',
        description: '搜索满足过滤条件的下一帧',
        sequences: ['right'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    SEARCH_BACKWARD: {
        name: '向后搜索',
        description: '搜索满足过滤条件的上一帧',
        sequences: ['left'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
    PLAY_PAUSE: {
        name: '播放/暂停',
        description: '开始/停止自动切换帧',
        sequences: ['space'],
        scope: ShortcutScope.ANNOTATION_PAGE,
    },
};

registerComponentShortcuts(componentShortcuts);

function PlayerButtons(props: Props): JSX.Element {
    const {
        playing,
        playPauseShortcut,
        nextFrameShortcut,
        previousFrameShortcut,
        forwardShortcut,
        backwardShortcut,
        keyMap,
        navigationType,
        workspace,
        onSwitchPlay,
        onPrevFrame,
        onNextFrame,
        onForward,
        onBackward,
        onFirstFrame,
        onLastFrame,
        setNavigationType,
        onSearchAnnotations,
    } = props;

    const handlers: Partial<Record<keyof typeof componentShortcuts, ((event?: KeyboardEvent) => void)>> = {
        NEXT_FRAME: (event: KeyboardEvent | undefined) => {
            event?.preventDefault();
            onNextFrame();
        },
        PREV_FRAME: (event: KeyboardEvent | undefined) => {
            event?.preventDefault();
            onPrevFrame();
        },
        ...(workspace !== Workspace.SINGLE_SHAPE ? {
            FORWARD_FRAME: (event: KeyboardEvent | undefined) => {
                event?.preventDefault();
                onForward();
            },
            BACKWARD_FRAME: (event: KeyboardEvent | undefined) => {
                event?.preventDefault();
                onBackward();
            },
            SEARCH_FORWARD: (event: KeyboardEvent | undefined) => {
                event?.preventDefault();
                onSearchAnnotations('forward');
            },
            SEARCH_BACKWARD: (event: KeyboardEvent | undefined) => {
                event?.preventDefault();
                onSearchAnnotations('backward');
            },
            PLAY_PAUSE: (event: KeyboardEvent | undefined) => {
                event?.preventDefault();
                onSwitchPlay();
            },
        } : {}),
    };

    const prevRegularText = '返回';
    const prevFilteredText = '带过滤器返回';
    const prevEmptyText = '回到空帧';
    const nextRegularText = '前进';
    const nextFilteredText = '带过滤器前进';
    const nextEmptyText = '前往下一个空帧';

    let prevButton = <Icon className='cvat-player-previous-button' component={PreviousIcon} onClick={onPrevFrame} />;
    let prevButtonTooltipMessage = prevRegularText;
    if (navigationType === NavigationType.FILTERED) {
        prevButton = (
            <Icon
                className='cvat-player-previous-button-filtered'
                component={PreviousFilteredIcon}
                onClick={onPrevFrame}
            />
        );
        prevButtonTooltipMessage = prevFilteredText;
    } else if (navigationType === NavigationType.EMPTY) {
        prevButton = (
            <Icon className='cvat-player-previous-button-empty' component={PreviousEmptyIcon} onClick={onPrevFrame} />
        );
        prevButtonTooltipMessage = prevEmptyText;
    }

    let nextButton = <Icon className='cvat-player-next-button' component={NextIcon} onClick={onNextFrame} />;
    let nextButtonTooltipMessage = nextRegularText;
    if (navigationType === NavigationType.FILTERED) {
        nextButton = (
            <Icon className='cvat-player-next-button-filtered' component={NextFilteredIcon} onClick={onNextFrame} />
        );
        nextButtonTooltipMessage = nextFilteredText;
    } else if (navigationType === NavigationType.EMPTY) {
        nextButton = <Icon className='cvat-player-next-button-empty' component={NextEmptyIcon} onClick={onNextFrame} />;
        nextButtonTooltipMessage = nextEmptyText;
    }

    const navIconStyle: CSSProperties = workspace === Workspace.SINGLE_SHAPE ? {
        pointerEvents: 'none',
        opacity: 0.5,
    } : {};

    return (
        <Col className='cvat-player-buttons'>
            <GlobalHotKeys keyMap={subKeyMap(componentShortcuts, keyMap)} handlers={handlers} />
            <CVATTooltip title='转到第一帧'>
                <Icon
                    style={navIconStyle}
                    className='cvat-player-first-button'
                    component={FirstIcon}
                    onClick={onFirstFrame}
                />
            </CVATTooltip>
            <CVATTooltip title={`向后跳几步 ${backwardShortcut}`}>
                <Icon
                    style={navIconStyle}
                    className='cvat-player-backward-button'
                    component={BackJumpIcon}
                    onClick={onBackward}
                />
            </CVATTooltip>
            <Popover
                trigger='contextMenu'
                placement='bottom'
                content={(
                    <>
                        <CVATTooltip title={`${prevRegularText}`}>
                            <Icon
                                className='cvat-player-previous-inlined-button'
                                component={PreviousIcon}
                                onClick={() => setNavigationType(NavigationType.REGULAR)}
                            />
                        </CVATTooltip>
                        <CVATTooltip title={`${prevFilteredText}`}>
                            <Icon
                                className='cvat-player-previous-filtered-inlined-button'
                                component={PreviousFilteredIcon}
                                onClick={() => setNavigationType(NavigationType.FILTERED)}
                            />
                        </CVATTooltip>
                        <CVATTooltip title={`${prevEmptyText}`}>
                            <Icon
                                className='cvat-player-previous-empty-inlined-button'
                                component={PreviousEmptyIcon}
                                onClick={() => setNavigationType(NavigationType.EMPTY)}
                            />
                        </CVATTooltip>
                    </>
                )}
            >
                <CVATTooltip placement='top' title={`${prevButtonTooltipMessage} ${previousFrameShortcut}`}>
                    {prevButton}
                </CVATTooltip>
            </Popover>

            {!playing ? (
                <CVATTooltip title={`播放 ${playPauseShortcut}`}>
                    <Icon
                        style={navIconStyle}
                        className='cvat-player-play-button'
                        component={PlayIcon}
                        onClick={onSwitchPlay}
                    />
                </CVATTooltip>
            ) : (
                <CVATTooltip title={`暂停 ${playPauseShortcut}`}>
                    <Icon
                        style={navIconStyle}
                        className='cvat-player-pause-button'
                        component={PauseIcon}
                        onClick={onSwitchPlay}
                    />
                </CVATTooltip>
            )}

            <Popover
                trigger='contextMenu'
                placement='bottom'
                content={(
                    <>
                        <CVATTooltip title={`${nextRegularText}`}>
                            <Icon
                                className='cvat-player-next-inlined-button'
                                component={NextIcon}
                                onClick={() => setNavigationType(NavigationType.REGULAR)}
                            />
                        </CVATTooltip>
                        <CVATTooltip title={`${nextFilteredText}`}>
                            <Icon
                                className='cvat-player-next-filtered-inlined-button'
                                component={NextFilteredIcon}
                                onClick={() => setNavigationType(NavigationType.FILTERED)}
                            />
                        </CVATTooltip>
                        <CVATTooltip title={`${nextEmptyText}`}>
                            <Icon
                                className='cvat-player-next-empty-inlined-button'
                                component={NextEmptyIcon}
                                onClick={() => setNavigationType(NavigationType.EMPTY)}
                            />
                        </CVATTooltip>
                    </>
                )}
            >
                <CVATTooltip placement='top' title={`${nextButtonTooltipMessage} ${nextFrameShortcut}`}>
                    {nextButton}
                </CVATTooltip>
            </Popover>
            <CVATTooltip title={`向前跳几步 ${forwardShortcut}`}>
                <Icon
                    style={navIconStyle}
                    className='cvat-player-forward-button'
                    component={ForwardJumpIcon}
                    onClick={onForward}
                />
            </CVATTooltip>
            <CVATTooltip title='转到最后一帧'>
                <Icon
                    style={navIconStyle}
                    className='cvat-player-last-button'
                    component={LastIcon}
                    onClick={onLastFrame}
                />
            </CVATTooltip>
        </Col>
    );
}

export default React.memo(PlayerButtons);
