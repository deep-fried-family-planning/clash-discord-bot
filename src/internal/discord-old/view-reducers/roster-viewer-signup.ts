import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {ROSTER_DESIGNATIONS, ROSTER_ROUNDS_CWL, ROSTER_ROUNDS_ODCWL, UNAVAILABLE} from '#src/constants/ix-constants.ts';
import {RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import {OPTION_UNAVAILABLE} from '#src/constants/select-options.ts';
import {asSuccess, asViewer, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, SingleS, SubmitB, SuccessB} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import {dtNow} from '#src/internal/discord-old/util/markdown.ts';
import {RosterS, RosterViewerB} from '#src/internal/discord-old/view-reducers/roster-viewer.ts';
import {viewUserPlayerOptions} from '#src/internal/discord-old/views/user-player-options.ts';
import {rosterSignupCreate, rosterSignupRead} from '#src/dynamo/operations/roster-signup.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import type {DRosterSignup} from '#src/dynamo/schema/discord-roster-signup.ts';
import type {DRoster} from '#src/dynamo/schema/discord-roster.ts';
import {CSL, DT, E, pipe} from '#src/internal/pure/effect.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {filterL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import type {bool, num, str} from '#src/internal/pure/types-pure.ts';
import type {SelectOption} from 'dfx/types';



const getAccounts = (s: St, rosterId: str) => E.gen(function* () {
  const records = yield * queryPlayersForUser({pk: s.user_id});
  const players = yield * ClashCache.getPlayers(records.map((r) => r.sk));

  const signup = yield * rosterSignupRead({
    pk: rosterId,
    sk: s.user_id,
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
  description: `war search approx: ${pipe(
    DT.unsafeMakeZoned(roster.search_time, {timeZone: s.user!.timezone}),
    DT.addDuration(`${idx * 2} day`),
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
) => E.gen(function* () {
  yield * CSL.debug('selected', userId, rosterId, designation, rounds, tags);

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
              designation : designation === UNAVAILABLE
                ? 'default'
                : designation,
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


export const RosterViewerSignupB = SuccessB.as(makeId(RK_OPEN, 'RVSU'), {
  label: 'Signup',
});
const SubmitSignup               = SubmitB.as(makeId(RK_SUBMIT, 'RVSU'), {label: 'Signup'});

const SelectAccounts     = SingleS.as(makeId(RK_UPDATE, 'RVSUAC'), {
  placeholder: 'Select Accounts',
});
const SelectAvailability = SingleS.as(makeId(RK_UPDATE, 'RVSUAV'), {
  placeholder: 'Select Availability',
  options    : ROSTER_ROUNDS_CWL,
});
const SelectDesignation  = SingleS.as(makeId(RK_UPDATE, 'RVSUD'), {
  placeholder: 'Select Designation',
  options    : ROSTER_DESIGNATIONS,
});


const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((s) => s.value);

  const Roster = RosterS.fromMap(s.cmap);


  const roster = yield * rosterRead({
    pk: s.server_id,
    sk: Roster.values[0],
  });

  // const roster = yield * rosterRead({pk: s.server_id, sk: Roster.values[0]});

  let Availability = SelectAvailability
    .fromMap(s.cmap)
    .setDefaultValuesIf(ax.id.predicate, selected);

  let Accounts    = SelectAccounts.fromMap(s.cmap);
  let Designation = SelectDesignation.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  if (RosterViewerSignupB.clicked(ax)) {
    const accounts = yield * getAccounts(s, Roster.values[0]);

    const availabilityOptions = ['cwl', 'cwl-at-large'].includes(roster.roster_type) ? ROSTER_ROUNDS_CWL.map(approximateRoundStartTimesCWL(s, roster))
      : roster.roster_type === 'odcwl' ? ROSTER_ROUNDS_ODCWL.map(approximateRoundStartTimesODCWL(s, roster))
        : OPTION_UNAVAILABLE;

    Accounts     = SelectAccounts.render({
      options: accounts.length
        ? accounts
        : [{
          label: 'No Accounts Available To Signup',
          value: UNAVAILABLE,
        }],
    });
    Availability = Availability.render({
      disabled  : !['cwl', 'cwl-at-large', 'odcwl'].includes(roster.roster_type),
      options   : availabilityOptions,
      max_values: availabilityOptions.length,
    });
    Designation  = Designation.render({
      disabled: !['cwl', 'cwl-at-large'].includes(roster.roster_type),
      options:
        ['cwl', 'cwl-at-large'].includes(roster.roster_type) ? ROSTER_DESIGNATIONS
          : OPTION_UNAVAILABLE,
    });
  }
  Accounts = Accounts.setDefaultValuesIf(ax.id.predicate, selected);

  const Submit = SubmitSignup.fromMap(s.cmap) ?? SubmitSignup;
  // const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);


  if (Submit.clicked(ax)) {
    yield * signupRoster(
      s.user_id,
      Roster.values[0],
      Designation.values[0],
      Availability.values,
      Accounts.values,
    );
  }


  return {
    ...s,
    title      : 'Roster Signup',
    description: unset,

    viewer: asViewer({
      ...s.viewer,
      footer: unset!,
    }),

    navigate: Roster.render({disabled: true}),
    sel1    : Accounts.render({
      disabled:
        Accounts.component.options![0].value === UNAVAILABLE
        || Submit.clicked(ax),
    }),
    sel2: Availability.render({
      disabled: Submit.clicked(ax) || Availability.options.options?.length === 1,
    }),
    sel3: Designation.render({
      disabled: Submit.clicked(ax) || Designation.options.options?.length === 1,
    }),

    status:
      Submit.clicked(ax)
        ? asSuccess({description: 'Signed Up!'})
        : undefined,

    submit:
      Submit.clicked(ax)
        ? RosterViewerSignupB.render({
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


export const rosterViewerSignupReducer = {
  [RosterViewerSignupB.id.predicate]: view,
  [SelectAccounts.id.predicate]     : view,
  [SelectAvailability.id.predicate] : view,
  [SelectDesignation.id.predicate]  : view,
  [SubmitSignup.id.predicate]       : view,
};
