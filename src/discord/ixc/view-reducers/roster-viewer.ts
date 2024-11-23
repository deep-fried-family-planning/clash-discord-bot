import {PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect';
import {RosterViewerAdminB} from '#src/discord/ixc/view-reducers/roster-viewer-admin.ts';
import type {snflk} from '#src/discord/types.ts';
import {asViewer} from '#src/discord/ixc/components/component-utils.ts';


export const RosterViewerB = PrimaryB.as(makeId(RDXK.OPEN, 'RV'), {
    label: 'Rosters',
});
const RosterSelector = SingleS.as(makeId(RDXK.UPDATE, 'RV'), {
    placeholder: 'Select Roster',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((v) => v.value);
    const Roster = RosterSelector.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    return {
        ...s,
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
        sel1: Roster,
        row2: [
            RosterViewerAdminB.if(s.user_roles.includes(s.server!.admin as snflk)),
        ],
    };
}));


export const rosterViewerReducer = {
    [RosterViewerB.id.predicate] : view,
    [RosterSelector.id.predicate]: view,
};
