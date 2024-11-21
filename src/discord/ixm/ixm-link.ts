import {Discord, UI} from 'dfx';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {EMBED_AXN} from '#src/discord/ixc/component-reducers/embed-editor.ts';

export const IxmLink = {
    title     : 'Link Account',
    custom_id : AXN.NLINK_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : AXN.NLINK_TAG.custom_id,
            label      : 'Player Tag',
            placeholder: 'check in-game profile',
        }),
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : AXN.NLINK_API.custom_id,
            label      : 'API Token',
            placeholder: 'check in-game settings',
        }),
        // UI.textInput({
        //     style      : Discord.TextInputStyle.PARAGRAPH,
        //     custom_id  : 'modal-link-account-about',
        //     label      : 'Tell Us About Yourself',
        //     placeholder: 'fun facts',
        // }),
    ]),
};


export const EMBED_EDTI_MODAL = {
    title     : 'Link Account',
    custom_id : EMBED_AXN.EMBED_EDITOR_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : AXN.NLINK_TAG.custom_id,
            label      : 'Player Tag',
            placeholder: 'check in-game profile',
        }),
        UI.textInput({
            style      : Discord.TextInputStyle.PARAGRAPH,
            custom_id  : AXN.NLINK_API.custom_id,
            label      : 'API Token',
            placeholder: 'check in-game settings',
        }),
        // UI.textInput({
        //     style      : Discord.TextInputStyle.PARAGRAPH,
        //     custom_id  : 'modal-link-account-about',
        //     label      : 'Tell Us About Yourself',
        //     placeholder: 'fun facts',
        // }),
    ]),
};
