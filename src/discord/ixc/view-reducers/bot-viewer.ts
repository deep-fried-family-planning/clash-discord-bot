import {BackB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId} from '#src/discord/ixc/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {BotViewerDevB, DEVS} from '#src/discord/ixc/view-reducers/bot-viewer-dev.ts';
import {RK_OPEN} from '#src/internal/constants/route-kind.ts';
import type {Ax} from '#src/discord/ixc/store/derive-action.ts';
import type {St} from '#src/discord/ixc/store/derive-state.ts';
import {LABEL_TITLE_ABOUT_DEEPFRYER} from '#src/internal/constants/label.ts';


export const BotViewer = PrimaryB.as(makeId(RK_OPEN, 'BV'), {
    label: 'Bot',
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    return {
        ...s,
        title      : LABEL_TITLE_ABOUT_DEEPFRYER,
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back  : BackB.as(OmbiBoardB.id),
        delete: BotViewerDevB.if(DEVS.includes(s.user_id)),
    };
});


export const botViewerReducer = {
    [BotViewer.id.predicate]: view,
};
