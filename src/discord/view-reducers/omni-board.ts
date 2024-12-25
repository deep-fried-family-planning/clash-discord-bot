import {LABEL_LINK, LABEL_START, LABEL_TITLE_LINK} from '#src/constants/label.ts';
import {RK_ENTRY, RK_OPEN} from '#src/constants/route-kind.ts';
import {unset} from '#src/discord/components/component-utils.ts';
import {BackB, SuccessB} from '#src/discord/components/global-components.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import type {snflk} from '#src/discord/types.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';
import {AccountViewerB} from '#src/discord/view-reducers/account-viewer.ts';
import {BotViewerDevB, DEVS} from '#src/discord/view-reducers/bot-viewer-dev.ts';
import {BotViewer} from '#src/discord/view-reducers/bot-viewer.ts';
import {ClanViewerB} from '#src/discord/view-reducers/clan-viewer.ts';
import {InfoViewerB} from '#src/discord/view-reducers/info-viewer.ts';
import {LinkAccountAdminB} from '#src/discord/view-reducers/links/link-account-admin.ts';
import {LinkAccountB} from '#src/discord/view-reducers/links/link-account.ts';
import {RosterViewerB} from '#src/discord/view-reducers/roster-viewer.ts';
import {ServerViewerB} from '#src/discord/view-reducers/server-viewer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {UserB} from './user-settings.ts';


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
