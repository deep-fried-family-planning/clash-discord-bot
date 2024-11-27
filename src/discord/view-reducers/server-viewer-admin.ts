import {AdminB, BackB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';

import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/components/component-utils.ts';
import {ServerViewerB} from '#src/discord/view-reducers/server-viewer.ts';
import {RK_OPEN} from '#src/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';


export const ServerViewerAdminB = AdminB.as(makeId(RK_OPEN, 'SVA'));


const view = (s: St, ax: Ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Edit Server',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(ServerViewerB.id),
    };
});


export const serverViewerAdminReducer = {
    [ServerViewerAdminB.id.predicate]: view,
};
