import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {DT, E, pipe} from '#src/internal/pure/effect';
import {RosterViewerAdminB} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {StartB} from '#src/discord/ixc/view-reducers/info-board.ts';
import {RosterSignupB} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {RosterOptOutB} from '#src/discord/ixc/view-reducers/roster-opt-out.ts';
import {RosterCreateB} from '#src/discord/ixc/view-reducers/roster-create.ts';
import {rosterQueryByServer, rosterRead} from '#src/dynamo/operations/roster.ts';
import type {Embed} from 'dfx/types';
import type {und} from '#src/internal/pure/types-pure.ts';
import {rosterSignupByRoster} from '#src/dynamo/operations/roster-signup.ts';


const getRosters = typeRxHelper((s, ax) => E.gen(function * () {
    const rosters = yield * rosterQueryByServer({pk: s.server_id});

    return rosters;
}));


export const RosterViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'RV'), {
    label: 'Rosters',
});
export const RosterS = SingleS.as(makeId(RDXK.UPDATE, 'RV'), {
    placeholder: 'Select Roster',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);
    let Roster = RosterS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    let viewer: Embed | und;

    if (RosterViewerB.clicked(ax)) {
        const rosters = yield * getRosters(s, ax);

        Roster = RosterS
            .render({
                options: rosters.map((r) => ({
                    label      : r.name,
                    value      : r.sk,
                    description: r.roster_type,
                })),
            });

        viewer = {
            title: 'No Roster Selected',
        };
    }

    if (Roster.id.predicate === ax.id.predicate) {
        const roster = yield * rosterRead({
            pk: s.server_id,
            sk: Roster.values[0],
        });

        const signups = yield * rosterSignupByRoster({pk: Roster.values[0]});

        viewer = {
            title      : roster.name,
            description: roster.description,
            timestamp  : pipe(
                roster.search_time,
                DT.withDateUtc((d) => d.toISOString()),
            ),
            footer: {
                text: JSON.stringify(signups),
            },
        };
    }


    return {
        ...s,
        title      : 'Rosters',
        description: unset,

        viewer: asViewer(
            s.editor
            ?? viewer
            ?? s.viewer,
        ),
        editor: undefined,
        status: undefined,

        sel1: Roster.render({disabled: false}),
        row2: [
            RosterSignupB.render({disabled: !Roster.values.length}).fwd(RosterViewerB.id),
            RosterOptOutB.render({disabled: !Roster.values.length}).fwd(RosterViewerB.id),
            RosterViewerAdminB
                .if(s.user_roles.includes(s.server!.admin as snflk))
                ?.render({disabled: !Roster.values.length}),
        ],
        back  : BackB.as(StartB.id),
        submit: RosterCreateB
            .if(s.user_roles.includes(s.server!.admin as snflk))
            ?.render({
                disabled: !!Roster.values.length,
            }),
    };
}));


export const rosterViewerReducer = {
    [RosterViewerB.id.predicate]: view,
    [RosterS.id.predicate]      : view,
};
