import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {snflk} from '#src/discord/types.ts';
import {UserB} from './user-edit.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {ClanViewerB} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {LinkAccountAdminB} from '#src/discord/ixc/view-reducers/links/link-account-admin.ts';
import {LinkClanB} from '#src/discord/ixc/view-reducers/links/link-clan.ts';
import {RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {AccountViewerB} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';


const axn = {
    ENTRY: makeId(RDXK.ENTRY, 'INFO'),
    OPEN : makeId(RDXK.OPEN, 'INFO'),
};


export const StartEB = SuccessB.as(axn.ENTRY, {
    label: 'Start',
});
export const StartB = SuccessB.as(axn.OPEN, {
    label: 'Start',
});


const start = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Start Page',
        description: `Welcome <@${s.user_id}>`,

        viewer: unset,
        editor: unset,
        status: unset,

        row1: [
            LinkB,
            ClanViewerB,
            RosterViewerB,
        ],
    };
}));


export const LinkB = SuccessB.as(makeId(RDXK.OPEN, 'LINK'), {
    label: 'Link',
});
const link = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Link',
        description: undefined,

        viewer: unset,
        editor: unset,
        status: unset,

        row1: [
            LinkAccountB,
            AccountViewerB,
            UserB.fwd(StartB.id),
        ],

        back  : BackB.as(StartB.id),
        delete: LinkAccountAdminB.if(s.user_roles.includes(s.server!.admin as snflk)),
    };
}));


export const infoBoardReducer = {
    [StartEB.id.predicate]: start,
    [StartB.id.predicate] : start,
    [LinkB.id.predicate]  : link,
};
