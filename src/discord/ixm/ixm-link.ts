import {Discord, UI} from 'dfx';

export const IxmLink = {
    title     : 'Link Account',
    custom_id : `modal-link-account`,
    components: UI.singleColumn([
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : 'modal-link-account-player-tag',
            label      : 'Player Tag',
            placeholder: 'check in-game profile',
        }),
        UI.textInput({
            style      : Discord.TextInputStyle.SHORT,
            custom_id  : 'modal-link-account-api-token',
            label      : 'API Token',
            placeholder: 'check in-game settings',
        }),
        UI.textInput({
            style      : Discord.TextInputStyle.PARAGRAPH,
            custom_id  : 'modal-link-account-about',
            label      : 'Tell Us About Yourself',
            placeholder: 'fun facts',
        }),
    ]),
};
