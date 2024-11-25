import {BackB, DangerB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';


export const DEVS = [
    '644290645350940692',
    '267835119421751306',
];


export const BotViewerDevB = DangerB.as(makeId(RDXK.OPEN, 'BVD'), {
    label: 'Dev',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Secret',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),
    };
}));


export const botViewerDevReducer = {
    [BotViewerDevB.id.predicate]: view,
};
