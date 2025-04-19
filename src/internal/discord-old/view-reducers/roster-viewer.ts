import {UNAVAILABLE} from '#src/constants/ix-constants.ts';
import {LABEL_ROSTERS, LABEL_TITLE_ROSTERS} from '#src/constants/label.ts';
import {PLACEHOLDER_ROSTER} from '#src/constants/placeholder.ts';
import {RK_OPEN, RK_UPDATE} from '#src/constants/route-kind.ts';
import {asViewer, unset} from '#src/internal/discord-old/components/component-utils.ts';
import {BackB, PrimaryB, SingleS} from '#src/internal/discord-old/components/global-components.ts';
import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import {makeId} from '#src/internal/discord-old/store/type-rx.ts';
import type {snflk} from '#src/internal/discord-old/types.ts';
import {dHdr3, dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {OmbiBoardB} from '#src/internal/discord-old/view-reducers/omni-board.ts';
import {RosterOverviewB} from '#src/internal/discord-old/view-reducers/roster-overview.ts';
import {RosterViewerAdminB} from '#src/internal/discord-old/view-reducers/roster-viewer-admin.ts';
import {RosterViewerCreatorB} from '#src/internal/discord-old/view-reducers/roster-viewer-creator.ts';
import {RosterViewerOptOutAdminB} from '#src/internal/discord-old/view-reducers/roster-viewer-opt-out-admin.ts';
import {RosterViewerOptOutB} from '#src/internal/discord-old/view-reducers/roster-viewer-opt-out.ts';
import {RosterViewerSignupAdminB} from '#src/internal/discord-old/view-reducers/roster-viewer-signup-admin.ts';
import {RosterViewerSignupB} from '#src/internal/discord-old/view-reducers/roster-viewer-signup.ts';
import {viewServerRosterOptions} from '#src/internal/discord-old/views/server-roster-options.ts';
import {isAdmin} from '#src/internal/discord-old/views/util.ts';
import {rosterSignupByRoster} from '#src/dynamo/operations/roster-signup.ts';
import {rosterQueryByServer, rosterRead} from '#src/dynamo/operations/roster.ts';
import type {DRoster} from '#src/dynamo/schema/discord-roster.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import type {num, und} from '#src/internal/pure/types-pure.ts';
import type {Embed, SelectOption} from 'dfx/types';
import {toEntries} from 'effect/Record';



const getRosters = (s: St) => E.gen(function* () {
  const rosters = yield * rosterQueryByServer({pk: s.server_id});

  return rosters;
});


export const RosterViewerB = PrimaryB.as(makeId(RK_OPEN, 'RV'), {
  label: LABEL_ROSTERS,
});
export const RosterS       = SingleS.as(makeId(RK_UPDATE, 'RV'), {
  placeholder: PLACEHOLDER_ROSTER,
});

const approximateRoundStartTimesCWL   = (s: St, roster: DRoster) => (o: SelectOption, idx: num) => ({
  ...o,
  description: `Round ${idx + 1}/7 ~start: ${pipe(
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
  description: `ODCWL ${idx + 1}/3 ~search: ${pipe(
    DT.unsafeMakeZoned(roster.search_time, {timeZone: s.user!.timezone}),
    DT.addDuration(`${idx * 2} day`),
    DT.format({
      dateStyle: 'short',
      timeStyle: 'short',
      locale   : s.original.locale!,
    }),
  )}`,
});


const view = (s: St, ax: Ax) => E.gen(function* () {
  const selected = ax.selected.map((v) => v.value);
  let Roster     = RosterS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

  let viewer: Embed | und;

  if (RosterViewerB.clicked(ax)) {
    const rosters = yield * getRosters(s);

    Roster = RosterS
      .render({
        options: rosters.length
          ? viewServerRosterOptions(rosters)
          : [{
            label: UNAVAILABLE,
            value: UNAVAILABLE,
          }],
      });

    viewer = {
      title: 'No Roster Selected',
    };
  }

  if (Roster.values.length) {
    const roster = yield * rosterRead({
      pk: s.server_id,
      sk: Roster.values[0],
    });

    const rosterSignups = yield * rosterSignupByRoster({pk: Roster.values[0]});
    const signups       = rosterSignups.flatMap((s) => pipe(s.accounts, toEntries));

    viewer = {
      title      : roster.name!,
      description: dLinesS(
        roster.description!,
        dHdr3('War Start/Search Times'),
        ...pipe(
          Array(
            ['cwl', 'cwl-at-large'].includes(roster.roster_type) ? 7
              : roster.roster_type === 'odcwl' ? 3
                : 0,
          ).fill(0),
          mapL(() => ({})),
          mapL(
            // @ts-expect-error deprecated anyway
            ['cwl', 'cwl-at-large'].includes(roster.roster_type) ? approximateRoundStartTimesCWL(s, roster)
              : approximateRoundStartTimesODCWL(s, roster),
          ),
          mapL(
            (o) => o.description,
          ),
        ),
      ),
      footer: {
        text: dLinesS(
          `Users signed up: ${rosterSignups.length}`,
          `Accounts signed up: ${signups.length}`,
        ),
      },
    };
  }


  return {
    ...s,
    title      : LABEL_TITLE_ROSTERS,
    description: unset,

    reference: {},
    system   : unset,

    viewer: asViewer(
      viewer,
    ),
    editor: unset,
    status: unset,

    sel1: Roster.render({
      disabled: Roster.component.options![0].value === UNAVAILABLE,
    }),
    row2: [
      RosterViewerSignupB.render({disabled: !Roster.values.length}),
      RosterViewerOptOutB.render({disabled: !Roster.values.length}),
      RosterOverviewB.render({disabled: !Roster.values.length}),
      RosterViewerSignupAdminB.if(isAdmin(s))?.render({disabled: !Roster.values.length}),
      RosterViewerOptOutAdminB.if(isAdmin(s))?.render({disabled: !Roster.values.length}),
    ],
    back: BackB.as(OmbiBoardB.id),
    submit:
      Roster.values.length
        ? RosterViewerAdminB.if(s.user_roles.includes(s.server!.admin as snflk))
        : RosterViewerCreatorB.if(s.user_roles.includes(s.server!.admin as snflk)),
  } satisfies St;
});


export const rosterViewerReducer = {
  [RosterViewerB.id.predicate]: view,
  [RosterS.id.predicate]      : view,
};
