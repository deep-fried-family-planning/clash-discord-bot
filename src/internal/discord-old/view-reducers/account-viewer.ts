import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {DESC_NO_ACCOUNT_SELECTED} from '#src/constants/description.ts';
import {LABEL_ACCOUNTS, LABEL_YOUR_ACCOUNTS} from '#src/constants/label.ts';
import {PLACEHOLDER_SELECT_ACCOUNT} from '#src/constants/placeholder.ts';
import {RK_OPEN, RK_UPDATE} from '#src/constants/route-kind.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {asViewer, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, NewB, PrimaryB, SingleS} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {AccountViewerAdminB} from '#src/internal/discord-old/view-reducers/account-viewer-admin.ts';
import {LinkAccountB} from '#src/internal/discord-old/view-reducers/links/link-account.ts';
import {LinkB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {viewUserPlayerOptions} from '#src/internal/discord-old/views/user-player-options.ts';
import {E} from '#src/internal/pure/effect.ts';

export const AccountViewerB = PrimaryB.as(makeId(RK_OPEN, 'AV'), {
  label: LABEL_ACCOUNTS,
});
export const AccountViewerAccountS = SingleS.as(makeId(RK_UPDATE, 'AVA'), {
  placeholder: PLACEHOLDER_SELECT_ACCOUNT,
});

export const getPlayers = (s: St) => E.gen(function* () {
  const records = yield* queryPlayersForUser({pk: s.user_id});
  const players = yield* ClashCache.getPlayers(records.map((r) => r.sk));

  return viewUserPlayerOptions(records, players);
});

const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  let Account = AccountViewerAccountS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  if (AccountViewerB.clicked(ax)) {
    Account = AccountViewerAccountS.render({
      options: yield* getPlayers(s),
    });
  }

  return {
    ...s,
    title      : LABEL_YOUR_ACCOUNTS,
    description: undefined,

    viewer: asViewer(
      s.editor
      ?? s.viewer
      ?? Account.values[0]
        ? {
          title: Account.values[0],
        }
        : {
          description: DESC_NO_ACCOUNT_SELECTED,
        },
    ),
    editor: undefined,
    status: undefined,

    sel1: Account.render({disabled: false}),

    back: BackB.as(LinkB.id),

    submit:
      !Account.values.length
        ? LinkAccountB.render({
          label: unset!,
          emoji: NewB.component.emoji!,
        })
        : AccountViewerAdminB,
  } satisfies St;
});

export const accountViewerReducer = {
  [AccountViewerB.id.predicate]       : view,
  [AccountViewerAccountS.id.predicate]: view,
};
