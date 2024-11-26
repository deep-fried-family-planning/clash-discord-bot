import {BackB, DangerB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/view-reducers/omni-board.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {RK_OPEN} from '#src/internal/constants/route-kind.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';


export const DEVS = [
    '644290645350940692',
    '267835119421751306',
];


export const BotViewerDevB = DangerB.as(makeId(RK_OPEN, 'BVD'), {
    label: 'Dev',
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Secret',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),
    } satisfies St;
});


export const botViewerDevReducer = {
    [BotViewerDevB.id.predicate]: view,
};
