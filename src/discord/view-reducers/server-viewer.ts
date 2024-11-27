import {BackB, PrimaryB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';

import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/components/component-utils.ts';
import {ServerViewerAdminB} from '#src/discord/view-reducers/server-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {OmbiBoardB} from '#src/discord/view-reducers/omni-board.ts';
import {RK_OPEN} from '#src/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';


export const ServerViewerB = PrimaryB.as(makeId(RK_OPEN, 'SV'), {
    label: 'Server',
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Server',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),

        delete: ServerViewerAdminB
            .if(s.user_roles.includes(s.server!.admin as snflk)),
    } satisfies St;
});


export const serverViewerReducer = {
    [ServerViewerB.id.predicate]: view,
};
