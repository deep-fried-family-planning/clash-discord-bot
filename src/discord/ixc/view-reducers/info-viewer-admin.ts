import {AdminB, BackB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoViewerB} from '#src/discord/ixc/view-reducers/info-viewer.ts';


export const InfoViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'IVA'), {
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Edit Info Page',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(InfoViewerB.id),
    };
}));


export const infoViewerAdminReducer = {
    [InfoViewerAdminB.id.predicate]: view,
};
