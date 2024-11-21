import {makeId, typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {ForwardB, PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect';
import {ApiMT, TagMT} from '#src/discord/ixc/components/components.ts';


export const EMBED_AXN = {
    EMBED_EDITOR_OPEN        : makeId(RDXK.OPEN, 'EMBED'),
    EMBED_EDITOR_MODAL_OPEN  : makeId(RDXK.MODAL_OPEN, 'EMBED'),
    EMBED_EDITOR_MODAL_SUBMIT: makeId(RDXK.MODAL_SUBMIT, 'EMBED'),
};


export const EmbedEditorB = PrimaryB.as(EMBED_AXN.EMBED_EDITOR_OPEN, {
    label: 'Edit Embed',
});
const EditB = PrimaryB.as(EMBED_AXN.EMBED_EDITOR_MODAL_OPEN, {
    label: 'Edit',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const name = TagMT.fromMap(ax.cmap);
    const description = ApiMT.fromMap(ax.cmap);


    const Forward = ForwardB.fromMap(s.cmap) ?? ForwardB.forward(ax.id);

    return {
        ...s,
        title      : 'Embed Editor',
        description: 'description',
        info       : {
            title      : name?.value ?? 'x',
            description: description?.value ?? 'x',
        },
        submit : EditB,
        forward: Forward.render({
            disabled: true,
        }),
    };
}));


export const embedEditorReducer = {
    [EMBED_AXN.EMBED_EDITOR_OPEN.predicate]        : view,
    [EMBED_AXN.EMBED_EDITOR_MODAL_SUBMIT.predicate]: view,
};
