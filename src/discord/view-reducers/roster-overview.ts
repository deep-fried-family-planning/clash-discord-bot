import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {LABEL_OVERVIEW, LABEL_TITLE_ROSTER_OVERVIEW} from '#src/constants/label.ts';
import {RK_OPEN} from '#src/constants/route-kind.ts';
import {asViewer} from '#src/discord/components/component-utils.ts';
import {BackB, PrimaryB} from '#src/discord/components/global-components.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {RosterS, RosterViewerB} from '#src/discord/view-reducers/roster-viewer.ts';
import {viewServerRosterSignupEmbed} from '#src/discord/views/server-roster-signup-embed.ts';
import {rosterSignupByRoster} from '#src/dynamo/operations/roster-signup.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {toEntries} from 'effect/Record';



export const RosterOverviewB = PrimaryB.as(makeId(RK_OPEN, 'RO'), {
  label: LABEL_OVERVIEW,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
  const Roster = RosterS.fromMap(s.cmap);

  const roster = yield * rosterRead({
    pk: s.server_id,
    sk: Roster.values[0],
  });

  const rosterSignups = yield * rosterSignupByRoster({pk: Roster.values[0]});
  const signups       = rosterSignups.flatMap((s) => pipe(s.accounts, toEntries));

  const players = yield * ClashCache.getPlayers(signups.map(([tag]) => tag));


  return {
    ...s,
    title : LABEL_TITLE_ROSTER_OVERVIEW,
    viewer: asViewer(
      viewServerRosterSignupEmbed(roster, signups, players),
    ),
    navigate: Roster.render({disabled: true}),
    back    : BackB.as(RosterViewerB.id),
  };
});


export const rosterOverviewReducer = {
  [RosterOverviewB.id.predicate]: view,
};
