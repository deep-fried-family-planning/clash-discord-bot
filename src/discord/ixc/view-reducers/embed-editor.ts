import {makeId, typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect';
import {
    EDIT_EMBED_MODAL_OPEN, EDIT_EMBED_MODAL_SUBMIT, EditEmbedColorT,
    EditEmbedDescriptionT,
    EditEmbedTitleT,
} from '#src/discord/ixc/modals/edit-embed-modal.ts';
import {nAnyColor} from '#src/internal/constants/colors.ts';


export const EMBED_AXN = {
    EMBED_EDITOR_OPEN: makeId(RDXK.OPEN, 'EMBED'),
};


export const EmbedEditorB = PrimaryB.as(EMBED_AXN.EMBED_EDITOR_OPEN, {
    label: 'Edit Embed',
});
export const EditEmbedB = PrimaryB.as(EDIT_EMBED_MODAL_OPEN, {
    label: 'Edit',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const name = EditEmbedTitleT.fromMap(ax.cmap);
    const description = EditEmbedDescriptionT.fromMap(ax.cmap);
    const color = EditEmbedColorT.fromMap(ax.cmap);


    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);
    nAnyColor;
    return {
        ...s,
        title : 'Embed Editor',
        editor: {
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
            footer: {
                text: 'Editing',
            },
        },
        submit : EditEmbedB.fromMap(s.cmap) ?? EditEmbedB.forward(ax.id),
        forward: Forward.render({
            disabled: !name?.value && !description?.value,
        }),
    };
}));


export const embedEditorReducer = {
    [EMBED_AXN.EMBED_EDITOR_OPEN.predicate]: view,
    [EDIT_EMBED_MODAL_OPEN.predicate]      : view,
    [EDIT_EMBED_MODAL_SUBMIT.predicate]    : view,
};
