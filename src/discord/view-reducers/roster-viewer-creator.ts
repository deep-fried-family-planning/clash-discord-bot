import {makeId} from '#src/discord/store/type-rx.ts';
import {BackB, NewB, SingleS, SubmitB} from '#src/discord/components/global-components.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {RosterViewerB} from '#src/discord/view-reducers/roster-viewer.ts';
import {asEditor, asSuccess, unset} from '#src/discord/components/component-utils.ts';
import {EmbedEditorB} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {DateTimeEditorB} from '#src/discord/view-reducers/editors/embed-date-time-editor.ts';
import {SELECT_POSITIONS, SELECT_ROSTER_TYPE} from '#src/discord/ix-constants.ts';
import {dtNow, dtNowIso} from '#src/discord/util/markdown.ts';
import {rosterCreate} from '#src/dynamo/operations/roster.ts';
import {v4} from 'uuid';
import {discordEmbedCreate} from '#src/dynamo/operations/embed.ts';
import type {num} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';
import type {St} from '#src/discord/store/derive-state.ts';
import {RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/internal/constants/route-kind.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {PLACEHOLDER_POSITION, PLACEHOLDER_ROSTER_TYPE} from '#src/internal/constants/placeholder.ts';
import {LABEL_TITLE_CREATE_ROSTER} from '#src/internal/constants/label.ts';


const saveRoster = (s: St, type: string, order: num, embed?: Embed) => E.gen(function * () {
    const rosterId = v4();
    const embedId = v4();

    yield * rosterCreate({
        type: 'DiscordRoster',
        pk  : s.server_id,
        sk  : rosterId,

        version: '1.0.0',
        created: dtNow(),
        updated: dtNow(),

        embed_id      : embedId,
        selector_order: order,
        selector_label: s.editor?.title,
        selector_desc : type,

        name       : s.editor?.title ?? '',
        description: s.editor?.description ?? '',
        clan       : undefined,
        search_time: pipe(
            DT.unsafeMake(s.editor!.timestamp!),
            DT.withDate(DT.unsafeFromDate),
        ),
        roster_type: type,
    });


    yield * discordEmbedCreate({
        type        : 'DiscordEmbed',
        pk          : embedId,
        sk          : 'now',
        gsi_embed_id: embedId,

        version: '1.0.0',
        created: dtNow(),
        updated: dtNow(),

        original_type     : 'DiscordRoster',
        original_pk       : s.server_id,
        original_sk       : rosterId,
        original_server_id: s.server_id,
        original_user_id  : s.user_id,

        embed: embed!,
    });
});


export const RosterViewerCreatorB = NewB.as(makeId(RK_OPEN, 'RVC'));
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'RVC'));
const TypeS = SingleS.as(makeId(RK_UPDATE, 'RVCT'), {
    placeholder: PLACEHOLDER_ROSTER_TYPE,
    options    : SELECT_ROSTER_TYPE,
});
const PositionS = SingleS.as(makeId(RK_UPDATE, 'RVCP'), {
    placeholder: PLACEHOLDER_POSITION,
    options    : SELECT_POSITIONS,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    if (Submit.clicked(ax)) {
        yield * saveRoster(s, Type.values[0], parseInt(Position.values[0]));
    }

    return {
        ...s,
        title      : LABEL_TITLE_CREATE_ROSTER,
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

        sel1: Type.render({
            disabled:
                Submit.clicked(ax),
        }),
        sel2: Position.render({
            disabled:
                Submit.clicked(ax),
        }),
        row3: [
            EmbedEditorB.fwd(RosterViewerCreatorB.id).render({
                disabled:
                    Submit.clicked(ax),
            }),
            DateTimeEditorB.fwd(RosterViewerCreatorB.id).render({
                label: 'Search Date/Time',
                disabled:
                    Submit.clicked(ax),
            }),
        ],
        back  : BackB.as(RosterViewerB.id),
        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || !Position.values.length
                || !Type.values.length,
        }),
    };
});


export const rosterViewerCreatorReducer = {
    [RosterViewerCreatorB.id.predicate]: view,
    [Submit.id.predicate]              : view,
    [TypeS.id.predicate]               : view,
};

