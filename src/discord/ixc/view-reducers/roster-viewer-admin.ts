import {BackB, PrimaryB, SingleS} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect';
import {RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {asEditor} from '#src/discord/ixc/components/component-utils.ts';
import {DateTimeEditorB} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {ClanSelectB} from '#src/discord/ixc/view-reducers/clans/clan-select.ts';


export const RosterViewerAdminB = PrimaryB.as(makeId(RDXK.OPEN, 'RVA'), {
    label: 'Admin',
});
const RosterSelector = SingleS.as(makeId(RDXK.UPDATE, 'RVA'), {
    placeholder: 'Select Roster',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        editor: asEditor(s.editor ?? s.viewer),
        row1  : [
            EmbedEditorB.fwd(RosterViewerAdminB.id),
            DateTimeEditorB.fwd(RosterViewerAdminB.id),
            ClanSelectB.fwd(RosterViewerAdminB.id).render({
                label: 'Clan',
            }),
        ],
        back: BackB.as(RosterViewerB.id),
    };
}));


export const rosterViewerAdminReducer = {
    [RosterViewerAdminB.id.predicate]: view,
    [RosterSelector.id.predicate]    : view,
};
