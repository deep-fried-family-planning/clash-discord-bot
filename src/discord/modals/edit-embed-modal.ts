import {makeText} from '#src/discord/components/make-text.ts';
import {IXCTS} from '#src/internal/discord.ts';
import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/constants/route-kind.ts';


export const EDIT_EMBED_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'EE'});
export const EDIT_EMBED_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'EE'});


export const EditEmbedTitleT = makeText({
    kind: RK_TEXT,
    type: 'EET',
}, {
    label      : 'Edit Title',
    style      : IXCTS.SHORT,
    placeholder: 'title',
});


export const EditEmbedDescriptionT = makeText({
    kind: RK_TEXT,
    type: 'EED',
}, {
    label      : 'Edit Description',
    style      : IXCTS.PARAGRAPH,
    placeholder: 'description',
});


export const EditEmbedColorT = makeText({
    kind: RK_TEXT,
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
