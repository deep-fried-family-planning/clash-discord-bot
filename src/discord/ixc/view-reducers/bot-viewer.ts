import {BackB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';


export const BotViewer = PrimaryB.as(makeId(RDXK.OPEN, 'BV'), {
    label: 'Bot',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'About DeepFryer',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),
    };
}));


export const botViewerReducer = {
    [BotViewer.id.predicate]: view,
};
