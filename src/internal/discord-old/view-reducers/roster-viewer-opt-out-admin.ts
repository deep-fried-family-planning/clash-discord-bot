import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {UNAVAILABLE} from '#src/constants/ix-constants.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_UPDATE} from '#src/constants/route-kind.ts';
import {asConfirm, asSuccess, asViewer, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, DangerB, DeleteB, DeleteConfirmB, SingleS, SingleUserS} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {dtNow} from '#src/internal/discord-old/util/markdown.ts';
import {RosterS, RosterViewerB} from '#src/internal/discord-old/view-reducers/roster-viewer.ts';
import {viewUserPlayerOptions} from '#src/internal/discord-old/views/user-player-options.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {filterKV} from '#src/internal/pure/pure-kv.ts';
import {filterL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



const getSignupsForUser = (userId: str, rosterId: str) => E.gen(function * () {
  const records = yield * queryPlayersForUser({pk: userId});
  const players = yield * ClashCache.getPlayers(records.map((r) => r.sk));

  const signup = yield * rosterSignupRead({
    pk: rosterId,
    sk: userId,
  });

  if (!signup) {
    return [];
  }

  return viewUserPlayerOptions(
    pipe(
      records,
      filterL((r) => !!signup.accounts[r.sk]),
    ),
    pipe(
      players,
      filterL((p) => !!signup.accounts[p.tag]),
    ),
  );
});


const deleteSignup = (userId: str, rosterId: str, tag: str) => E.gen(function * () {
  const signup = yield * rosterSignupRead({pk: rosterId, sk: userId});

  yield * rosterSignupCreate({
    ...signup!,
    updated : dtNow(),
    accounts: pipe(
      signup!.accounts,
      filterKV((v, k) => k !== tag),
    ),
  });
});


export const RosterViewerOptOutAdminB = DangerB.as(makeId(RK_OPEN, 'RVOOA'), {
  label: 'Admin Opt Out',
});

const SelectAccounts = SingleS.as(makeId(RK_UPDATE, 'RVOOAA'), {
  placeholder: 'Select Accounts',
});
const Delete         = DeleteB.as(makeId(RK_DELETE, 'RVOOA'));
const DeleteConfirm  = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'RVOOA'));
const UserS          = SingleUserS.as(makeId(RK_UPDATE, 'RVOOAU'));

const view = (s: St, ax: Ax) => E.gen(function * () {
  const selected = ax.selected.map((s) => s.value);

  const User   = UserS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
  const Roster = RosterS.fromMap(s.cmap);
  let Accounts = SelectAccounts.fromMap(s.cmap);

  if (User.id.predicate === ax.id.predicate) {
    const accounts = yield * getSignupsForUser(User.values[0], Roster.values[0]);

    Accounts = SelectAccounts.render({
      options: accounts.length
        ? accounts
        : [{
          label: UNAVAILABLE,
          value: UNAVAILABLE,
        }],
    });
  }

  Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

  if (DeleteConfirm.clicked(ax)) {
    yield * deleteSignup(User.values[0], Roster.values[0], Accounts.values[0]);
  }

  return {
    ...s,
    title      : 'Roster Opt Out Admin',
    description: unset,

    viewer: asViewer({
      ...s.viewer,
      footer: unset!,
    }),

    status:
      Delete.clicked(ax) ? asConfirm({description: 'Are you sure you want to delete your signup?'})
        : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Signup deleted'})
          : undefined,

    navigate: User,
    sel1    : Roster.render({disabled: true}),
    sel2    : Accounts.render({
      disabled: Accounts.component.options![0].value === UNAVAILABLE,
    }),

    submit:
      Delete.clicked(ax) ? DeleteConfirm
        : DeleteConfirm.clicked(ax) ? RosterViewerOptOutAdminB.render({
            label: 'Opt Out Another Account',
          })
          : Delete.render({
            disabled:
              Accounts.values.length === 0,
          }),
    back: BackB.as(RosterViewerB.id),
  } satisfies St;
});


export const rosterViewerOptOutAdminReducer = {
  [RosterViewerOptOutAdminB.id.predicate]: view,
  [UserS.id.predicate]                   : view,
  [SelectAccounts.id.predicate]          : view,
  [Delete.id.predicate]                  : view,
  [DeleteConfirm.id.predicate]           : view,
};
