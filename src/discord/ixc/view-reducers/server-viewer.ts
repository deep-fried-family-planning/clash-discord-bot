import {BackB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {ServerViewerAdminB} from '#src/discord/ixc/view-reducers/server-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {InfoViewerB} from '#src/discord/ixc/view-reducers/info-viewer.ts';


export const ServerViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'SV'), {
    label: 'Server',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Server',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(InfoViewerB.id),

        delete: ServerViewerAdminB
            .if(s.user_roles.includes(s.server!.admin as snflk)),
    };
}));


export const serverViewerReducer = {
    [ServerViewerB.id.predicate]: view,
};
