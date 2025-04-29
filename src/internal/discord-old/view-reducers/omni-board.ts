import {LABEL_LINK, LABEL_START, LABEL_TITLE_LINK} from '#src/internal/discord-old/constants/label.ts';
import {RK_ENTRY, RK_OPEN} from '#src/internal/discord-old/constants/route-kind.ts';
import {unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, SuccessB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import type {snflk} from '#src/internal/discord-old/types.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {AccountViewerB} from '#src/internal/discord-old/view-reducers/account-viewer.ts';
import {BotViewerDevB, DEVS} from '#src/internal/discord-old/view-reducers/bot-viewer-dev.ts';
import {BotViewer} from '#src/internal/discord-old/view-reducers/bot-viewer.ts';
import {ClanViewerB} from '#src/internal/discord-old/view-reducers/clan-viewer.ts';
import {InfoViewerB} from '#src/internal/discord-old/view-reducers/info-viewer.ts';
import {LinkAccountAdminB} from '#src/internal/discord-old/view-reducers/links/link-account-admin.ts';
import {LinkAccountB} from '#src/internal/discord-old/view-reducers/links/link-account.ts';
import {RosterViewerB} from '#src/internal/discord-old/view-reducers/roster-viewer.ts';
import {ServerViewerB} from '#src/internal/discord-old/view-reducers/server-viewer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {UserB} from 'src/internal/discord-old/view-reducers/user-settings.ts';

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

const start = (s: St, ax: Ax) => E.gen(function* () {
  return {
    ...s,
    title      : 'Start',
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
const link = (s: St, ax: Ax) => E.gen(function* () {
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
