import {makeText} from '#src/discord/ixc/components/make-text.ts';
import {IXCTS} from '#src/discord/util/discord.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export const EDIT_EMBED_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'EE'});
export const EDIT_EMBED_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'EE'});


export const EditEmbedTitleT = makeText({
    kind: RDXK.TEXT,
    type: 'EET',
}, {
    label      : 'Edit Title',
    style      : IXCTS.SHORT,
    placeholder: 'title',
});


export const EditEmbedDescriptionT = makeText({
    kind: RDXK.TEXT,
    type: 'EED',
}, {
    label      : 'Edit Description',
    style      : IXCTS.PARAGRAPH,
    placeholder: 'description',
});


export const EditEmbedColorT = makeText({
    kind: RDXK.TEXT,
    type: 'EEC',
}, {
    label      : 'Edit Color',
    style      : IXCTS.SHORT,
    placeholder: 'hex value',
});


export const EditEmbedModal = {
    title     : 'Edit Embed',
    custom_id : EDIT_EMBED_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        EditEmbedTitleT.component,
        EditEmbedColorT.component,
        EditEmbedDescriptionT.component,
    ]),
};
