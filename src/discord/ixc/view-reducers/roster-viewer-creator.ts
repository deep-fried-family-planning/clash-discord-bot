import {typeRx, makeId, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, NewB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {DT, E, pipe, S} from '#src/internal/pure/effect.ts';
import {RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {asEditor, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {DateTimeEditorB} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {SELECT_ROSTER_TYPE} from '#src/discord/ix-constants.ts';
import {dtNow, dtNowIso} from '#src/discord/util/markdown.ts';
import {rosterCreate} from '#src/dynamo/operations/roster.ts';
import {v4} from 'uuid';


const saveRoster = (type: string) => typeRxHelper((s, ax) => E.gen(function * () {
    yield * rosterCreate({
        type: 'DiscordRoster',
        pk  : s.server_id,
        sk  : v4(),

        version: '1.0.0',
        created: dtNow(),
        updated: dtNow(),

        name       : s.editor?.title ?? '',
        description: s.editor?.description ?? '',
        clan       : undefined,
        search_time: pipe(
            DT.unsafeMake(s.editor!.timestamp!),
            DT.withDate(DT.unsafeFromDate),
        ),
        roster_type: type,
    });
}));


export const RosterViewerCreatorB = NewB.as(makeId(RDXK.OPEN, 'RC'));
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'RC'));
const TypeS = SingleS.as(makeId(RDXK.UPDATE, 'RCT'), {
    placeholder: 'Select Roster Type',
    options    : SELECT_ROSTER_TYPE,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (Submit.clicked(ax)) {
        yield * saveRoster(Type.values[0])(s, ax);
    }

    return {
        ...s,
        title      : 'Create Roster',
        description: unset,

        viewer: unset,
        editor: asEditor(
            s.editor
            ?? {
                title      : 'New Roster',
                description: 'New Roster Description',
                timestamp  : dtNowIso(),
            },
        ),
        status: Submit.clicked(ax)
            ? asSuccess({description: 'Roster Created'})
            : unset,

        sel1: Type,
        row3: [
            EmbedEditorB.fwd(RosterViewerCreatorB.id),
            DateTimeEditorB.fwd(RosterViewerCreatorB.id).render({
                label: 'Search Date/Time',
            }),
        ],
        back  : BackB.as(RosterViewerB.id),
        submit: Submit,
    };
}));


export const rosterViewerCreatorReducer = {
    [RosterViewerCreatorB.id.predicate]: view,
    [Submit.id.predicate]              : view,
    [TypeS.id.predicate]               : view,
};

