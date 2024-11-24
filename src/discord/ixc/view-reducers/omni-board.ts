import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {snflk} from '#src/discord/types.ts';
import {UserB} from './user-settings.ts';
import {LinkAccountB} from '#src/discord/ixc/view-reducers/links/link-account.ts';
import {ClanViewerB} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {LinkAccountAdminB} from '#src/discord/ixc/view-reducers/links/link-account-admin.ts';
import {RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {AccountViewerB} from '#src/discord/ixc/view-reducers/account-viewer.ts';
import {unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoViewerB} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {BotViewer} from '#src/discord/ixc/view-reducers/bot-viewer.ts';
import {ServerViewerB} from '#src/discord/ixc/view-reducers/server-viewer.ts';


const axn = {
    ENTRY: makeId(RDXK.ENTRY, 'INFO'),
    OPEN : makeId(RDXK.OPEN, 'INFO'),
};


export const OmbiBoardEB = SuccessB.as(axn.ENTRY, {
    label: 'Start',
});
export const OmbiBoardB = SuccessB.as(axn.OPEN, {
    label: 'Start',
});


const start = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title:
            (s.server?.alias ? s.server.alias : unset)
            ?? 'Start',
        description: dLinesS(
            `Hello <@${s.user_id}>`,
            `Admin View: ${s.user_roles.includes(s.server?.admin as snflk)}`,
        ),

        viewer: unset,
        editor: unset,
        status: unset,

        row1: [
            InfoViewerB,
            ClanViewerB,
            RosterViewerB,
            BotViewer,
        ],

        submit: LinkB,
        delete: ServerViewerB.if(s.user_roles.includes(s.server!.admin as snflk)),
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
            UserB.fwd(OmbiBoardB.id),
        ],

        back  : BackB.as(OmbiBoardB.id),
        delete: LinkAccountAdminB.if(s.user_roles.includes(s.server!.admin as snflk)),
    };
}));


export const infoBoardReducer = {
    [OmbiBoardEB.id.predicate]: start,
    [OmbiBoardB.id.predicate] : start,
    [LinkB.id.predicate]      : link,
};
