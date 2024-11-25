import {makeId} from '#src/discord/ixc/store/type-rx.ts';
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
import {BotViewerDevB, DEVS} from '#src/discord/ixc/view-reducers/bot-viewer-dev.ts';
import {RK_ENTRY, RK_OPEN} from '#src/internal/constants/route-kind.ts';
import type {St} from '#src/discord/ixc/store/derive-state.ts';
import type {Ax} from '#src/discord/ixc/store/derive-action.ts';
import {LABEL_LINK, LABEL_START, LABEL_TITLE_LINK} from '#src/internal/constants/label.ts';


const axn = {
    ENTRY: makeId(RK_ENTRY, 'INFO'),
    OPEN : makeId(RK_OPEN, 'INFO'),
};


export const OmbiBoardEB = SuccessB.as(axn.ENTRY, {
    label: LABEL_START,
});
export const OmbiBoardB = SuccessB.as(axn.OPEN, {
    label: LABEL_START,
});


const start = (s: St, ax: Ax) => E.gen(function * () {
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
        back  : BotViewerDevB.if(DEVS.includes(s.user_id)),
    } satisfies St;
});


export const LinkB = SuccessB.as(makeId(RK_OPEN, 'LINK'), {
    label: LABEL_LINK,
});
const link = (s: St, ax: Ax) => E.gen(function * () {
    return {
        ...s,
        title      : LABEL_TITLE_LINK,
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
    } satisfies St;
});


export const infoBoardReducer = {
    [OmbiBoardEB.id.predicate]: start,
    [OmbiBoardB.id.predicate] : start,
    [LinkB.id.predicate]      : link,
};
