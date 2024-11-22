import {Discord, UI} from 'dfx';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {EMBED_AXN} from '#src/discord/ixc/view-reducers/embed-editor.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const EMBED_EDTI_MODAL = (name: str, description: str) => ({
    title     : 'Edit Embed',
    custom_id : EMBED_AXN.EMBED_EDITOR_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : AXN.NLINK_TAG.custom_id,
            label      : 'Embed Name',
            placeholder: 'name',
            value      : name,
        }),
        UI.textInput({
            style      : Discord.TextInputStyle.PARAGRAPH,
            custom_id  : AXN.NLINK_API.custom_id,
            label      : 'Embed Description',
            placeholder: 'description',
            value      : description,
        }),
        // UI.textInput({
        //     style      : Discord.TextInputStyle.PARAGRAPH,
        //     custom_id  : 'modal-link-account-about',
        //     label      : 'Tell Us About Yourself',
        //     placeholder: 'fun facts',
        // }),
    ]),
});
