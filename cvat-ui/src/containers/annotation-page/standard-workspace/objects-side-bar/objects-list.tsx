// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';

import { connect } from 'react-redux';
import GlobalHotKeys, { KeyMap } from 'utils/mousetrap-react';

import ObjectsListComponent from 'components/annotation-page/standard-workspace/objects-side-bar/objects-list';
import {
    updateAnnotationsAsync,
    changeFrameAsync,
    collapseObjectItems,
    changeGroupColorAsync,
    copyShape as copyShapeAction,
    switchPropagateVisibility as switchPropagateVisibilityAction,
    switchSimplifyVisibility as switchSimplifyVisibilityAction,
    removeObject as removeObjectAction,
    fetchAnnotationsAsync,
    changeHideActiveObjectAsync,
} from 'actions/annotation-actions';
import {
    changeShowGroundTruth as changeShowGroundTruthAction,
} from 'actions/settings-actions';
import isAbleToChangeFrame from 'utils/is-able-to-change-frame';
import {
    CombinedState, StatesOrdering, ColorBy, Workspace,
    ActiveControl,
} from 'reducers';
import { ObjectState, ObjectType, ShapeType } from 'cvat-core-wrapper';
import { filterAnnotations } from 'utils/filter-annotations';
import { registerComponentShortcuts } from 'actions/shortcuts-actions';
import { ShortcutScope } from 'utils/enums';
import { subKeyMap } from 'utils/component-subkeymap';
import { openAnnotationsActionModal } from 'components/annotation-page/annotations-actions/annotations-actions-modal';

interface StateToProps {
    jobInstance: any;
    frameNumber: any;
    statesHidden: boolean;
    statesLocked: boolean;
    statesCollapsedAll: boolean;
    collapsedStates: Record<number, boolean>;
    objectStates: ObjectState[];
    annotationsFilters: any[];
    colors: string[];
    colorBy: ColorBy;
    activatedStateID: number | null;
    activatedElementID: number | null;
    minZLayer: number;
    maxZLayer: number;
    keyMap: KeyMap;
    normalizedKeyMap: Record<string, string>;
    showGroundTruth: boolean;
    workspace: Workspace;
    editedState: ObjectState | null,
    activeControl: ActiveControl,
    activeObjectHidden: boolean,
}

interface DispatchToProps {
    updateAnnotations(states: any[]): void;
    collapseStates(states: any[], value: boolean): void;
    removeObject: (objectState: any, force: boolean) => void;
    copyShape: (objectState: any) => void;
    switchPropagateVisibility: (visible: boolean) => void;
    switchSimplifyVisibility: (clientID: number | null) => void;
    changeFrame(frame: number): void;
    changeGroupColor(group: number, color: string): void;
    changeShowGroundTruth(value: boolean): void;
    changeHideEditedState(value: boolean): void;
}

const componentShortcuts = {
    SWITCH_ALL_LOCK: {
        name: '锁定/解锁所有对象',
        description: '更改侧栏中所有对象的锁定状态',
        sequences: ['t l'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_LOCK: {
        name: '锁定/解锁对象',
        description: '更改活动对象的锁定状态',
        sequences: ['l'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_ALL_HIDDEN: {
        name: '隐藏/显示所有对象',
        description: '更改侧栏中对象的隐藏状态',
        sequences: ['t h'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_HIDDEN: {
        name: '隐藏/显示对象',
        description: '更改活动对象的隐藏状态',
        sequences: ['h'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_OCCLUDED: {
        name: '切换遮挡',
        description: '更改活动对象的遮挡属性',
        sequences: ['q', '/'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_PINNED: {
        name: '切换固定属性',
        description: '更改活动对象的固定属性',
        sequences: ['p'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_KEYFRAME: {
        name: '切换关键帧',
        description: '更改活动轨迹的关键帧属性',
        sequences: ['k'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SWITCH_OUTSIDE: {
        name: '切换外部',
        description: '更改活动轨迹的外部属性',
        sequences: ['o'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    DELETE_OBJECT_STANDARD_WORKSPACE: {
        name: '删除对象',
        description: '删除活动对象。使用 Shift 强制删除锁定对象',
        sequences: ['del', 'shift+del'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    TO_BACKGROUND: {
        name: '移至背景',
        description: '将活动对象移至新创建的背景层（降低 z 序值）',
        sequences: ['-', '_'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    TO_FOREGROUND: {
        name: '移至前景',
        description: '将活动对象移至新创建的前景层（提高 z 序值）',
        sequences: ['+', '='],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    TO_ONE_LAYER_BACKWARD: {
        name: '向后移一层',
        description: '将活动对象向后移一层（降低 z 序值）',
        sequences: [],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    TO_ONE_LAYER_FORWARD: {
        name: '向前移一层',
        description: '将活动对象向前移一层（提高 z 序值）',
        sequences: [],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    COPY_SHAPE: {
        name: '复制形状',
        description: '将形状复制到 CVAT 内部剪贴板',
        sequences: ['ctrl+c'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    RUN_ANNOTATIONS_ACTION: {
        name: '运行标注操作',
        description: '打开标注操作对话框',
        sequences: ['ctrl+e'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    PROPAGATE_OBJECT: {
        name: '传播对象',
        description: '在以下帧上创建对象的副本',
        sequences: ['ctrl+b'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    NEXT_KEY_FRAME: {
        name: '下一关键帧',
        description: '转到活动轨迹的下一个关键帧',
        sequences: ['r'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    PREV_KEY_FRAME: {
        name: '上一关键帧',
        description: '转到活动轨迹的上一个关键帧',
        sequences: ['e'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    CHANGE_OBJECT_COLOR: {
        name: '更改颜色',
        description: '为激活的形状设置下一个颜色',
        sequences: ['enter'],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
    SIMPLIFY_POLYGON: {
        name: '简化多边形',
        description: '为选中的多边形或折线激活简化模式',
        sequences: [],
        scope: ShortcutScope.OBJECTS_SIDEBAR,
    },
};

registerComponentShortcuts(componentShortcuts);

function mapStateToProps(state: CombinedState): StateToProps {
    const {
        annotation: {
            annotations: {
                states: objectStates,
                filters: annotationsFilters,
                collapsed,
                collapsedAll,
                activatedStateID,
                activatedElementID,
                zLayer: { min: minZLayer, max: maxZLayer },
            },
            job: { instance: jobInstance },
            player: {
                frame: { number: frameNumber },
            },
            canvas: {
                activeControl, activeObjectHidden,
            },
            editing: { objectState: editedState },
            colors,
            workspace,
        },
        settings: {
            shapes: { colorBy, showGroundTruth },
        },
        shortcuts: { keyMap, normalizedKeyMap },
    } = state;

    let statesHidden = true;
    let statesLocked = true;

    objectStates.forEach((objectState: ObjectState) => {
        const { lock } = objectState;
        if (!lock) {
            if (objectState.objectType !== ObjectType.TAG) {
                if (objectState.shapeType === ShapeType.SKELETON) {
                    objectState.elements.forEach((element: ObjectState) => {
                        statesHidden = statesHidden && (element.lock || element.hidden);
                    });
                } else {
                    statesHidden = statesHidden && objectState.hidden;
                }
            }
            statesLocked = statesLocked && objectState.lock;
        }
    });

    return {
        statesHidden,
        statesLocked,
        statesCollapsedAll: collapsedAll,
        collapsedStates: collapsed,
        objectStates,
        frameNumber,
        jobInstance,
        annotationsFilters,
        colors,
        colorBy,
        activatedStateID,
        activatedElementID,
        minZLayer,
        maxZLayer,
        keyMap,
        normalizedKeyMap,
        showGroundTruth,
        workspace,
        editedState,
        activeControl,
        activeObjectHidden,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        updateAnnotations(states: ObjectState[]): void {
            dispatch(updateAnnotationsAsync(states));
        },
        collapseStates(states: ObjectState[], collapsed: boolean): void {
            dispatch(collapseObjectItems(states, collapsed));
        },
        removeObject(objectState: ObjectState, force: boolean): void {
            dispatch(removeObjectAction(objectState, force));
        },
        copyShape(objectState: ObjectState): void {
            dispatch(copyShapeAction(objectState));
        },
        switchPropagateVisibility(visible: boolean): void {
            dispatch(switchPropagateVisibilityAction(visible));
        },
        switchSimplifyVisibility(clientID: number | null): void {
            dispatch(switchSimplifyVisibilityAction(clientID));
        },
        changeFrame(frame: number): void {
            dispatch(changeFrameAsync(frame));
        },
        changeGroupColor(group: number, color: string): void {
            dispatch(changeGroupColorAsync(group, color));
        },
        changeShowGroundTruth(value: boolean): void {
            dispatch(changeShowGroundTruthAction(value));
            dispatch(fetchAnnotationsAsync());
        },
        changeHideEditedState(value: boolean): void {
            dispatch(changeHideActiveObjectAsync(value));
        },
    };
}

function sortAndMap(objectStates: ObjectState[], ordering: StatesOrdering): number[] {
    let sorted: ObjectState[] = [];
    if (ordering === StatesOrdering.ID_ASCENT) {
        sorted = [...objectStates].sort((a: ObjectState, b: ObjectState): number => (
            (a.clientID ?? 0) - (b.clientID ?? 0)
        ));
    } else if (ordering === StatesOrdering.ID_DESCENT) {
        sorted = [...objectStates].sort((a: ObjectState, b: ObjectState): number => (
            (b.clientID ?? 0) - (a.clientID ?? 0)
        ));
    } else if (ordering === StatesOrdering.UPDATED) {
        sorted = [...objectStates].sort((a: ObjectState, b: ObjectState): number => b.updated - a.updated);
    } else if (ordering === StatesOrdering.Z_ORDER) {
        sorted = [...objectStates].sort((a: ObjectState, b: ObjectState): number => a.zOrder - b.zOrder);
    } else if (ordering === StatesOrdering.LABEL_NAME) {
        sorted = [...objectStates].sort((a: ObjectState, b: ObjectState): number => {
            const labelComparison = a.label.name.localeCompare(b.label.name);
            if (labelComparison !== 0) {
                return labelComparison;
            }
            return (a.clientID ?? 0) - (b.clientID ?? 0);
        });
    } else {
        sorted = [...objectStates];
    }

    return sorted.map((state: ObjectState) => state.clientID).filter((id): id is number => id !== null);
}

type Props = StateToProps & DispatchToProps;

interface State {
    statesOrdering: StatesOrdering;
    objectStates: ObjectState[];
    filteredStates: ObjectState[];
    sortedStatesID: number[];
}

class ObjectsListContainer extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            statesOrdering: StatesOrdering.ID_ASCENT,
            objectStates: [],
            filteredStates: [],
            sortedStatesID: [],
        };
    }

    public componentDidMount(): void {
        this.updateObjects();
    }

    public componentDidUpdate(): void {
        const { objectStates } = this.props;
        const { objectStates: prevObjectStates } = this.state;
        if (objectStates !== prevObjectStates) {
            this.updateObjects();
        }
    }

    private updateObjects = (): void => {
        const {
            objectStates, frameNumber, workspace,
        } = this.props;
        const { statesOrdering } = this.state;
        const filteredStates = filterAnnotations(objectStates, {
            frame: frameNumber,
            workspace,
        });
        this.setState({
            objectStates,
            filteredStates,
            sortedStatesID: sortAndMap(filteredStates, statesOrdering),
        });
    };

    private onChangeStatesOrdering = (statesOrdering: StatesOrdering): void => {
        const { filteredStates } = this.state;
        this.setState({
            statesOrdering,
            sortedStatesID: sortAndMap(filteredStates, statesOrdering),
        });
    };

    private onLockAllStates = (): void => {
        this.lockAllStates(true);
    };

    private onUnlockAllStates = (): void => {
        this.lockAllStates(false);
    };

    private onCollapseAllStates = (): void => {
        this.collapseAllStates(true);
    };

    private onExpandAllStates = (): void => {
        this.collapseAllStates(false);
    };

    private onHideAllStates = (): void => {
        this.hideAllStates(true);
    };

    private onShowAllStates = (): void => {
        this.hideAllStates(false);
    };

    private changeShowGroundTruth = (): void => {
        const { showGroundTruth, changeShowGroundTruth } = this.props;
        changeShowGroundTruth(!showGroundTruth);
    };

    private lockAllStates(locked: boolean): void {
        const { updateAnnotations } = this.props;
        const { filteredStates } = this.state;

        for (const objectState of filteredStates) {
            objectState.lock = locked;
        }

        updateAnnotations(filteredStates);
    }

    private hideAllStates(hidden: boolean): void {
        const { updateAnnotations, editedState, changeHideEditedState } = this.props;
        const { filteredStates } = this.state;

        if (editedState?.shapeType === ShapeType.MASK) {
            changeHideEditedState(hidden);
        }

        for (const objectState of filteredStates) {
            objectState.hidden = hidden;
        }

        updateAnnotations(filteredStates);
    }

    private collapseAllStates(collapsed: boolean): void {
        const { collapseStates } = this.props;
        const { filteredStates } = this.state;

        collapseStates(filteredStates, collapsed);
    }

    public render(): JSX.Element {
        const {
            statesHidden,
            statesLocked,
            activatedStateID,
            activatedElementID,
            maxZLayer,
            minZLayer,
            keyMap,
            normalizedKeyMap,
            colors,
            colorBy,
            statesCollapsedAll,
            showGroundTruth,
            updateAnnotations,
            changeGroupColor,
            removeObject,
            copyShape,
            switchPropagateVisibility,
            switchSimplifyVisibility,
            changeFrame,
            workspace,
        } = this.props;
        const {
            objectStates, sortedStatesID, statesOrdering, filteredStates,
        } = this.state;

        const preventDefault = (event?: KeyboardEvent): void => {
            if (event) {
                event.preventDefault();
            }
        };

        const activatedState = (ignoreElements = false): ObjectState | null => {
            if (activatedStateID !== null) {
                const state = objectStates
                    .find((objectState: ObjectState): boolean => objectState.clientID === activatedStateID);

                if (state && activatedElementID !== null && !ignoreElements) {
                    const element = state.elements
                        .find((_element: ObjectState): boolean => _element.clientID === activatedElementID);
                    return element || null;
                }

                return state || null;
            }

            return null;
        };

        const handlers: Record<keyof typeof componentShortcuts, (event?: KeyboardEvent) => void> = {
            SWITCH_ALL_LOCK: (event?: KeyboardEvent) => {
                preventDefault(event);
                this.lockAllStates(!statesLocked);
            },
            SWITCH_LOCK: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state) {
                    state.lock = !state.lock;
                    updateAnnotations([state]);
                }
            },
            SWITCH_ALL_HIDDEN: (event?: KeyboardEvent) => {
                preventDefault(event);
                this.hideAllStates(!statesHidden);
            },
            SWITCH_HIDDEN: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                const {
                    editedState, changeHideEditedState, activeControl, activeObjectHidden,
                } = this.props;
                if (editedState?.shapeType === ShapeType.MASK || activeControl === ActiveControl.DRAW_MASK) {
                    const hide = editedState ? !editedState.hidden : !activeObjectHidden;
                    changeHideEditedState(hide);
                }
                if (state) {
                    state.hidden = !state.hidden;
                    updateAnnotations([state]);
                }
            },
            SWITCH_OCCLUDED: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state && state.objectType !== ObjectType.TAG) {
                    state.occluded = !state.occluded;
                    updateAnnotations([state]);
                }
            },
            SWITCH_PINNED: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state) {
                    state.pinned = !state.pinned;
                    updateAnnotations([state]);
                }
            },
            SWITCH_KEYFRAME: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state && state.objectType === ObjectType.TRACK) {
                    const { first, last } = state.keyframes as NonNullable<typeof state.keyframes>;
                    if (first !== last || !state.keyframe) {
                        state.keyframe = !state.keyframe;
                        updateAnnotations([state]);
                    }
                }
            },
            SWITCH_OUTSIDE: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state && (state.objectType === ObjectType.TRACK || state.parentID)) {
                    state.outside = !state.outside;
                    updateAnnotations([state]);
                }
            },
            DELETE_OBJECT_STANDARD_WORKSPACE: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state) {
                    removeObject(state, event ? event.shiftKey : false);
                }
            },
            CHANGE_OBJECT_COLOR: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state) {
                    if (colorBy === ColorBy.GROUP && state.group) {
                        const colorID = (colors.indexOf(state.group.color) + 1) % colors.length;
                        changeGroupColor(state.group.id, colors[colorID]);
                        return;
                    }

                    if (colorBy === ColorBy.INSTANCE) {
                        const colorID = (colors.indexOf(state.color) + 1) % colors.length;
                        state.color = colors[colorID];
                        updateAnnotations([state]);
                    }
                }
            },
            TO_BACKGROUND: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state && state.objectType !== ObjectType.TAG) {
                    state.zOrder = minZLayer - 1;
                    updateAnnotations([state]);
                }
            },
            TO_FOREGROUND: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state && state.objectType !== ObjectType.TAG) {
                    state.zOrder = maxZLayer + 1;
                    updateAnnotations([state]);
                }
            },
            TO_ONE_LAYER_BACKWARD: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state && state.objectType !== ObjectType.TAG) {
                    state.zOrder -= 1;
                    updateAnnotations([state]);
                }
            },
            TO_ONE_LAYER_FORWARD: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state && state.objectType !== ObjectType.TAG) {
                    state.zOrder += 1;
                    updateAnnotations([state]);
                }
            },
            COPY_SHAPE: () => {
                const state = activatedState(true);
                if (state) {
                    copyShape(state);
                }
            },
            RUN_ANNOTATIONS_ACTION: () => {
                const state = activatedState(true);
                if (state) {
                    openAnnotationsActionModal({ defaultObjectState: state });
                } else {
                    openAnnotationsActionModal();
                }
            },
            PROPAGATE_OBJECT: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state) {
                    switchPropagateVisibility(true);
                }
            },
            NEXT_KEY_FRAME: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state && state.keyframes) {
                    const frame = typeof state.keyframes.next === 'number' ? state.keyframes.next : null;
                    if (frame !== null && isAbleToChangeFrame(frame)) {
                        changeFrame(frame);
                    }
                }
            },
            PREV_KEY_FRAME: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState();
                if (state && state.keyframes) {
                    const frame = typeof state.keyframes.prev === 'number' ? state.keyframes.prev : null;
                    if (frame !== null && isAbleToChangeFrame(frame)) {
                        changeFrame(frame);
                    }
                }
            },
            SIMPLIFY_POLYGON: (event?: KeyboardEvent) => {
                preventDefault(event);
                const state = activatedState(true);
                if (state && [ShapeType.POLYGON, ShapeType.POLYLINE].includes(state.shapeType)) {
                    switchSimplifyVisibility(state.clientID);
                }
            },
        };

        return (
            <>
                <GlobalHotKeys keyMap={subKeyMap(componentShortcuts, keyMap)} handlers={handlers} />
                <ObjectsListComponent
                    statesHidden={statesHidden}
                    statesLocked={statesLocked}
                    statesCollapsedAll={statesCollapsedAll}
                    workspace={workspace}
                    statesOrdering={statesOrdering}
                    sortedStatesID={sortedStatesID}
                    showGroundTruth={showGroundTruth}
                    objectStates={filteredStates}
                    switchHiddenAllShortcut={normalizedKeyMap.SWITCH_ALL_HIDDEN}
                    switchLockAllShortcut={normalizedKeyMap.SWITCH_ALL_LOCK}
                    changeStatesOrdering={this.onChangeStatesOrdering}
                    lockAllStates={this.onLockAllStates}
                    unlockAllStates={this.onUnlockAllStates}
                    collapseAllStates={this.onCollapseAllStates}
                    expandAllStates={this.onExpandAllStates}
                    hideAllStates={this.onHideAllStates}
                    showAllStates={this.onShowAllStates}
                    changeShowGroundTruth={this.changeShowGroundTruth}
                />
            </>
        );
    }
}

export default connect(
    mapStateToProps, mapDispatchToProps,
)(ObjectsListContainer);
