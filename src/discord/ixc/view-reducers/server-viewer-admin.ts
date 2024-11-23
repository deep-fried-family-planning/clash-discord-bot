import {AdminB, BackB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {ServerViewerB} from '#src/discord/ixc/view-reducers/server-viewer.ts';


export const ServerViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'SVA'), {
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Edit Server',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(ServerViewerB.id),
    };
}));


export const serverViewerAdminReducer = {
    [ServerViewerAdminB.id.predicate]: view,
};
