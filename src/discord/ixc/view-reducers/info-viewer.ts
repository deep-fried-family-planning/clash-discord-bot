import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {OmbiBoardB} from '#src/discord/ixc/view-reducers/omni-board.ts';
import {InfoViewerAdminB} from '#src/discord/ixc/view-reducers/info-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';


export const InfoViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'IV'), {
    label: 'Info',
});
const KindNav = SingleS.as(makeId(RDXK.UPDATE, 'IVKN'));
const InfoNav = SingleS.as(makeId(RDXK.UPDATE, 'IVIN'));


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Info',
        description: unset,

        editor: unset,
        viewer: unset,
        status: unset,

        back: BackB.as(OmbiBoardB.id),


        delete: InfoViewerAdminB
            .if(s.user_roles.includes(s.server!.admin as snflk)),
    };
}));


export const infoViewerReducer = {
    [InfoViewerB.id.predicate]: view,
};
