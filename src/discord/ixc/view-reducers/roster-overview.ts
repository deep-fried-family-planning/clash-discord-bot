import {BackB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {rosterRead} from '#src/dynamo/operations/roster.ts';
import {rosterSignupByRoster} from '#src/dynamo/operations/roster-signup.ts';
import {toEntries} from 'effect/Record';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asViewer} from '#src/discord/ixc/components/component-utils.ts';
import {viewServerRosterSignupEmbed} from '#src/discord/ixc/views/server-roster-signup-embed.ts';


export const RosterOverviewB = PrimaryB.as(makeId(RDXK.OPEN, 'RO'), {
    label: 'Overview',
});


const view = (s: IxState, ax: IxAction) => E.gen(function * () {
    const Roster = RosterS.fromMap(s.cmap);

    const roster = yield * rosterRead({
        pk: s.server_id,
        sk: Roster.values[0],
    });

    const rosterSignups = yield * rosterSignupByRoster({pk: Roster.values[0]});
    const signups = rosterSignups.flatMap((s) => pipe(s.accounts, toEntries));

    const players = yield * Clashofclans.getPlayers(signups.map(([tag]) => tag));


    return {
        ...s,
        title : 'Roster Overview',
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
