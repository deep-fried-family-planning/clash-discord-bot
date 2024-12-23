import {makeId} from '#src/discord/store/type-rx.ts';
import {ForwardB, PrimaryB} from '#src/discord/components/global-components.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {EDIT_EMBED_MODAL_OPEN, EDIT_EMBED_MODAL_SUBMIT, EditEmbedColorT, EditEmbedDescriptionT, EditEmbedTitleT} from '#src/discord/modals/edit-embed-modal.ts';
import {nAnyColor} from '#src/constants/colors.ts';
import {IXCBS} from '#src/internal/discord.ts';
import {asEditor} from '#src/discord/components/component-utils.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {RK_OPEN} from '#src/constants/route-kind.ts';


export const EmbedEditorB = PrimaryB.as(makeId(RK_OPEN, 'EMBED'), {
    label: 'Embed',
});
export const EditEmbedB = PrimaryB.as(EDIT_EMBED_MODAL_OPEN, {
    label: 'Modal',
    style: IXCBS.SUCCESS,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const name = EditEmbedTitleT.fromMap(ax.cmap);
    const description = EditEmbedDescriptionT.fromMap(ax.cmap);
    const color = EditEmbedColorT.fromMap(ax.cmap);

    yield * CSL.debug('ax', ax.id.custom_id);
    yield * CSL.debug('state', ax.id.custom_id);

    const Forward = ForwardB.forward(ax.id);

    return {
        ...s,
        title: 'Embed Editor',

        editor: asEditor({
            ...s.editor,
            title:
                name?.value
                ?? s.editor?.title
                ?? '[Edit Title]',
            description:
                description?.value
                ?? s.editor?.description
                ?? '[Edit Description]',
            color:
                color?.value ? nAnyColor(color.value)
                : s.editor?.color ? s.editor.color
                : 0,
        }),

        submit : EditEmbedB.fromMap(s.cmap) ?? EditEmbedB.forward(ax.id),
        forward: Forward.render({
            disabled: !name?.value && !description?.value,
        }),
    } satisfies St;
});


export const embedEditorReducer = {
    [EmbedEditorB.id.predicate]        : view,
    [EDIT_EMBED_MODAL_SUBMIT.predicate]: view,
};
