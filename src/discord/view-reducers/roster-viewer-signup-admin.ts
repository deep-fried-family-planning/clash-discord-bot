import {ClashCache} from '#src/clash/layers/clash-cash';
import {ROSTER_DESIGNATIONS, ROSTER_ROUNDS_CWL, UNAVAILABLE} from '#src/constants/ix-constants.ts';
import {REF_ROSTER_ID} from '#src/constants/reference.ts';
import {RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import {asSuccess, asViewer, unset} from '#src/discord/components/component-utils.ts';
import {BackB, SingleS, SingleUserS, SubmitB, SuccessB} from '#src/discord/components/global-components.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {dtNow} from '#src/discord/util/markdown.ts';
import {RosterS, RosterViewerB} from '#src/discord/view-reducers/roster-viewer.ts';
import {viewUserPlayerOptions} from '#src/discord/views/user-player-options.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import type {DRosterSignup} from '#src/dynamo/schema/discord-roster-signup.ts';
import type {DRoster} from '#src/dynamo/schema/discord-roster.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {filterL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import type {bool, num, str} from '#src/internal/pure/types-pure.ts';
import type {SelectOption} from 'dfx/types';



const getAccountsByUser = (userId: str, rosterId: str) => E.gen(function * () {
  const records = yield * queryPlayersForUser({pk: userId});
  const players = yield * ClashCache.getPlayers(records.map((r) => r.sk));

  const signup = yield * rosterSignupRead({
    pk: rosterId,
    sk: userId,
  });

  if (!signup) {
    return viewUserPlayerOptions(records, players);
  }

  return viewUserPlayerOptions(
    pipe(
      records,
      filterL((r) => !signup.accounts[r.sk]),
    ),
    pipe(
      players,
      filterL((p) => !signup.accounts[p.tag]),
    ),
  );
});


const approximateRoundStartTimesCWL   = (s: St, roster: DRoster) => (o: SelectOption, idx: num) => ({
  ...o,
  description: `war start approx: ${pipe(
    DT.unsafeMakeZoned(roster.search_time, {timeZone: s.user!.timezone}),
    DT.addDuration(`${idx + 1} day`),
    DT.format({
      dateStyle: 'short',
      timeStyle: 'short',
      locale   : s.original.locale!,
    }),
  )}`,
});
const approximateRoundStartTimesODCWL = (s: St, roster: DRoster) => (o: SelectOption, idx: num) => ({
  ...o,
  description: `war start approx: ${pipe(
    DT.unsafeMakeZoned(roster.search_time, {timeZone: s.user!.timezone}),
    DT.addDuration(`${idx + 2} day`),
    DT.format({
      dateStyle: 'short',
      timeStyle: 'short',
      locale   : s.original.locale!,
    }),
  )}`,
});


const signupRoster = (
  userId: str,
  rosterId: str,
  designation: str,
  rounds: str[],
  tags: str[],
) => E.gen(function * () {
  const signup = yield * rosterSignupRead({
    pk: rosterId,
    sk: userId,
  });

  const roundsAvailable = pipe(
    rounds,
    reduceL(emptyKV<str, bool>(), (rs, r) => {
      rs[r] = true;
      return rs;
    }),
  );
  const accounts        = pipe(
    tags,
    reduceL(emptyKV<str, DRosterSignup['accounts'][str]>(), (ts, t) => {
      ts[t] = pipe(
        Array(7).fill(0),
        mapL((_, idx) =>
          roundsAvailable[`${idx}`]
            ? {
              availability: true,
              designation : designation,
            }
            : {
              availability: false,
            },
        ),
      );
      return ts;
    }),
  );

  if (!signup) {
    return yield * rosterSignupCreate({
      type         : 'DiscordRosterSignup',
      pk           : rosterId,
      sk           : userId,
      gsi_roster_id: rosterId,
      gsi_user_id  : userId,
      version      : '1.0.0',
      created      : dtNow(),
      updated      : dtNow(),
      accounts     : accounts,
    });
  }

  yield * rosterSignupCreate({
    ...signup,
    accounts: {
      ...signup.accounts,
      ...accounts,
    },
    updated: dtNow(),
  });
});


export const RosterViewerSignupAdminB = SuccessB.as(makeId(RK_OPEN, 'RVSUA'), {
  label: 'Admin Signup',
});
const SubmitSignup                    = SubmitB.as(makeId(RK_SUBMIT, 'RVSUA'), {label: 'Signup'});

const SelectAccounts     = SingleS.as(makeId(RK_UPDATE, 'RVSUAAC'), {
  placeholder: 'Select Accounts',
});
const SelectAvailability = SingleS.as(makeId(RK_UPDATE, 'RVSUAAV'), {
  placeholder: 'Select Availability',
  options    : ROSTER_ROUNDS_CWL,
  max_values : ROSTER_ROUNDS_CWL.length,
});
const SelectDesignation  = SingleS.as(makeId(RK_UPDATE, 'RVSUAD'), {
  placeholder: 'Select Designation',
  options    : ROSTER_DESIGNATIONS,
});
const UserS              = SingleUserS.as(makeId(RK_UPDATE, 'RVSUAU'));


const view = (s: St, ax: Ax) => E.gen(function * () {
  const selected = ax.selected.map((s) => s.value);

  const User = UserS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  let roster_id = '';

  if (RosterViewerSignupAdminB.clicked(ax)) {
    const Roster = RosterS.fromMap(s.cmap);

    roster_id = Roster.values[0];
  }
  else {
    roster_id = s.reference[REF_ROSTER_ID];
  }

  let Availability = SelectAvailability.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
  let Accounts     = SelectAccounts.fromMap(s.cmap);

  if (User.id.predicate === ax.id.predicate) {
    const roster   = yield * rosterRead({
      pk: s.server_id,
      sk: roster_id,
    });
    const accounts = yield * getAccountsByUser(User.values[0], roster_id);

    Accounts     = SelectAccounts.render({
      options: accounts.length
        ? accounts
        : [{
          label: 'No Accounts Available To Signup',
          value: UNAVAILABLE,
        }],
    });
    Availability = Availability.render({
      options: Availability.options.options!.map(approximateRoundStartTimesCWL(s, roster)),
    });
  }
  Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

  const Designation = SelectDesignation.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
  const Submit      = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;

  if (Submit.clicked(ax)) {
    yield * signupRoster(
      User.values[0],
      roster_id,
      Designation.values[0],
      Availability.values,
      Accounts.values,
    );
  }

  return {
    ...s,
    title      : 'Roster Signup',
    description: unset,
    reference  : {
      [REF_ROSTER_ID]: roster_id,
    },

    viewer: asViewer({
      ...s.viewer,
      footer: unset!,
    }),

    navigate: User,
    sel1    : Accounts.render({
      disabled:
        Accounts.component.options![0].value === UNAVAILABLE
        || Submit.clicked(ax),
    }),
    sel2: Availability.render({
      disabled: Submit.clicked(ax),
    }),
    sel3: Designation.render({
      disabled: Submit.clicked(ax),
    }),

    status:
      Submit.clicked(ax)
        ? asSuccess({description: 'Signed Up!'})
        : undefined,

    submit:
      Submit.clicked(ax)
        ? RosterViewerSignupAdminB.render({
          label: 'Signup Another Account',
        })
        : Submit.render({
          disabled:
            Designation.values.length === 0
            || Availability.values.length === 0
            || Accounts.values.length === 0,
        }),

    back: BackB.as(RosterViewerB.id),
  } satisfies St;
});


export const rosterViewerSignupAdminReducer = {
  [RosterViewerSignupAdminB.id.predicate]: view,
  [UserS.id.predicate]                   : view,
  [SelectAccounts.id.predicate]          : view,
  [SelectAvailability.id.predicate]      : view,
  [SelectDesignation.id.predicate]       : view,
  [SubmitSignup.id.predicate]            : view,
};
