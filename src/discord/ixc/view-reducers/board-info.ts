import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, PrimaryB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {SelectRosterB} from '#src/discord/ixc/view-reducers/rosters/roster-select.ts';
import {SignupRosterB} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {OptoutRosterB} from '#src/discord/ixc/view-reducers/rosters/roster-opt-out.ts';
import {RosterManageB} from '#src/discord/ixc/view-reducers/rosters/roster-manage.ts';
import type {snflk} from '#src/discord/types.ts';
import {UserB} from './user-edit.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {ClanSelectB} from '#src/discord/ixc/view-reducers/clans/clan-select.ts';
import {ClanViewerB} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {ClanManageB} from '#src/discord/ixc/view-reducers/clans/clan-manage.ts';
import {LinkAccountManageB} from '#src/discord/ixc/view-reducers/links/link-account-manage.ts';
import {LinkClanB} from '#src/discord/ixc/view-reducers/links/link-clan.ts';


const axn = {
    ENTRY: makeId(RDXK.ENTRY, 'INFO'),
    OPEN : makeId(RDXK.OPEN, 'INFO'),
};


export const InfoEntryB = SuccessB.as(axn.ENTRY, {
    label: 'Start',
});
export const InfoB = SuccessB.as(axn.OPEN, {
    label: 'Start',
});


const start = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Start Page',
        description: `Welcome <@${s.user_id}>`,
        row1       : [
            LinkB,
            ClanSelectB.fwd(ClanViewerB.id),
            RostersB,
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
        description: `Welcome <@${s.user_id}>`,
        row1       : [
            LinkAccountB,
            LinkAccountManageB.if(s.user_roles.includes(s.server!.admin as snflk)),
            UserB.fwd(InfoEntryB.id),
        ],
        row2: [
            LinkClanB.if(s.user_roles.includes(s.server!.admin as snflk)),
        ],
        back: BackB.as(InfoB.id),
    };
}));


export const ClansB = PrimaryB.as(makeId(RDXK.OPEN, 'CS'), {
    label: 'Clans',
});
const clans = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Clans',
        description: `Welcome <@${s.user_id}>`,
        row1       : [
            LinkClanB,
            ClanSelectB.fwd(ClanViewerB.id),
        ],
        back: BackB.as(InfoB.id),
    };
}));


export const RostersB = PrimaryB.as(makeId(RDXK.OPEN, 'RS'), {
    label: 'Rosters',
});
const rosters = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Rosters',
        description: `Welcome <@${s.user_id}>`,
        row1       : [
            SelectRosterB
                .render(SignupRosterB.options)
                .fwd(SignupRosterB.id),
            SelectRosterB
                .render(OptoutRosterB.options)
                .fwd(OptoutRosterB.id),
            RosterManageB
                .if(s.user_roles.includes(s.server!.admin as snflk)),
        ],
        back: BackB.as(InfoB.id),
    };
}));


export const infoBoardReducer = {
    [InfoEntryB.id.predicate]: start,
    [InfoB.id.predicate]     : start,
    [LinkB.id.predicate]     : link,
    [ClansB.id.predicate]    : clans,
    [RostersB.id.predicate]  : rosters,
};
