import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {RosterManageB} from '#src/discord/ixc/view-reducers/rosters/roster-manage.ts';
import {DateTimeEditorB} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {ClanSelectB} from '#src/discord/ixc/view-reducers/clans/clan-select.ts';


const axn = {
    ROSTER_CREATE_OPEN  : makeId(RDXK.OPEN, 'RCREATE'),
    ROSTER_CREATE_SUBMIT: makeId(RDXK.SUBMIT, 'RCREATE'),
};


export const RosterCreateB = SuccessB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Create',
});
const Submit = SuccessB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Create',
});


const editRoster = typeRxHelper((s, ax) => E.gen(function * () {
    if (ax.id.predicate === axn.ROSTER_CREATE_SUBMIT.predicate) {
        return true;
    }

    return false;
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const clanTag
        = ax.forward
        ?? s.description
        ?? 'No Clan Selected';

    const isSubmitted = yield * editRoster(s, ax);

    return {
        ...s,
        title      : 'Create Roster',
        description: clanTag,
        editor:
            s.editor ? s.editor
            : {
                title      : 'New Roster Title',
                description: 'New Roster Description',
                footer     : {
                    text: 'Editing',
                },
                timestamp: new Date().toISOString(),
            },
        row1: [
            EmbedEditorB.fwd(RosterCreateB.id).render({
                disabled: isSubmitted,
            }),
            DateTimeEditorB.fwd(RosterCreateB.id).render({
                disabled: isSubmitted,
            }),
            ClanSelectB.fwd(RosterCreateB.id).render({
                label   : 'Clan',
                disabled: isSubmitted,
            }),
        ],
        back  : BackB.as(RosterManageB.id),
        submit: Submit.render({
            disabled: isSubmitted,
        }),
    };
}));


export const rosterCreateReducer = {
    [axn.ROSTER_CREATE_OPEN.predicate]  : view,
    [axn.ROSTER_CREATE_SUBMIT.predicate]: view,
};
