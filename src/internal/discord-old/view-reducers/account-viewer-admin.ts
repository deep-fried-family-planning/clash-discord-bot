import {SELECT_ACCOUNT_TYPE} from '#src/internal/discord-old/constants/ix-constants.ts';
import {LABEL_TITLE_EDIT_ACCOUNT} from '#src/internal/discord-old/constants/label.ts';
import {PLACEHOLDER_ACCOUNT_TYPE} from '#src/internal/discord-old/constants/placeholder.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/internal/discord-old/constants/route-kind.ts';
import {deleteDiscordPlayer, getDiscordPlayer, putDiscordPlayer} from '#src/internal/discord-old/dynamo/schema/discord-player.ts';
import {asConfirm, asEditor, asSuccess} from '#src/internal/discord-old/components/component-utils.ts';
import {AdminB, BackB, DeleteB, DeleteConfirmB, ForwardB, SingleS, SubmitB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {AccountViewerAccountS, AccountViewerB} from '#src/internal/discord-old/view-reducers/account-viewer.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';

const submit = (s: St, playerTag: str, accountType: str) => E.gen(function* () {
  const record = yield* getDiscordPlayer({pk: s.user_id, sk: playerTag});
  yield* putDiscordPlayer({
    ...record,
    updated     : new Date(Date.now()),
    account_type: accountType,
  });
});
const deletePlayer = (s: St, playerTag: str) => E.gen(function* () {
  yield* deleteDiscordPlayer({pk: s.user_id, sk: playerTag});
});

export const AccountViewerAdminB = AdminB.as(makeId(RK_OPEN, 'AVA'));
const AccountTypeS = SingleS.as(makeId(RK_UPDATE, 'AVAT'), {
  placeholder: PLACEHOLDER_ACCOUNT_TYPE,
  options    : SELECT_ACCOUNT_TYPE,
});
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'AVA'));
const Delete = DeleteB.as(makeId(RK_DELETE, 'AVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'AVA'));

const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  const Account = AccountViewerAccountS.fromMap(s.cmap);
  const AccountType = AccountTypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  if (Submit.clicked(ax)) {
    yield* submit(s, Account.values[0], AccountType.values[0]);
  }

  if (DeleteConfirm.clicked(ax)) {
    yield* deletePlayer(s, Account.values[0]);
  }

  const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

  return {
    ...s,
    title      : LABEL_TITLE_EDIT_ACCOUNT,
    description: undefined,

    viewer: undefined,
    editor: asEditor(
      s.viewer
      ?? s.editor,
    ),
    status:
      Submit.clicked(ax) ? asSuccess({description: 'Account Edited'})
        : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
          : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Account Deleted'})
            : undefined,

    sel1: Account.render({disabled: true}),
    sel2: AccountType.render({disabled: Submit.clicked(ax) || DeleteConfirm.clicked(ax)}),

    submit: Submit.render({
      disabled:
        Submit.clicked(ax)
        || Delete.clicked(ax)
        || DeleteConfirm.clicked(ax)
        || AccountType.values.length === 0,
    }),
    delete: (
      Delete.clicked(ax)
        ? DeleteConfirm
        : Delete
    ).render({
      disabled:
        Submit.clicked(ax)
        || DeleteConfirm.clicked(ax),
    }),
    back   : BackB.as(AccountViewerB.id),
    forward: Forward.render({
      disabled: !Submit.clicked(ax) || !DeleteConfirm.clicked(ax),
    }),
  } satisfies St;
});

export const accountViewerAdminReducer = {
  [AccountViewerAdminB.id.predicate]: view,
  [AccountTypeS.id.predicate]       : view,
  [Submit.id.predicate]             : view,
  [Delete.id.predicate]             : view,
  [DeleteConfirm.id.predicate]      : view,
};
