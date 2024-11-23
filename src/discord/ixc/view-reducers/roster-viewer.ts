import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect';
import {RosterViewerAdminB} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {asViewer, unset} from '#src/discord/ixc/components/component-utils.ts';
import {StartB} from '#src/discord/ixc/view-reducers/info-board.ts';
import {RosterSignupB} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {RosterOptOutB} from '#src/discord/ixc/view-reducers/roster-opt-out.ts';
import {RosterCreateB} from '#src/discord/ixc/view-reducers/roster-create.ts';


export const RosterViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'RV'), {
    label: 'Rosters',
});
export const RosterS = SingleS.as(makeId(RDXK.UPDATE, 'RV'), {
    placeholder: 'Select Roster',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);
    const Roster = RosterS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
        title      : 'Rosters',
        description: unset,

        viewer: asViewer(
            s.editor
            ?? s.viewer
            ?? Roster.values[0]
                ? {
                    title: Roster.values[0],
                }
                : {
                    description: 'No Roster Selected',
                },
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
