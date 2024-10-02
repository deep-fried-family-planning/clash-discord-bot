import {CMP, CMP_B} from '#src/discord/helpers/re-exports.ts';
import {discord_itr} from '#src/https/api-discord.ts';
import {MESSAGE} from '#src/discord/app-interactions/custom-id.ts';
import type {DButton, IButton} from '#src/discord/helpers/re-export-types.ts';
import {MODAL_LINK_ACCOUNT} from '#src/discord/app-interactions/components/modal-link-account.ts';

export const BUTTON_LINK_ACCOUNT
    = {
        type     : CMP.Button,
        style    : CMP_B.Primary,
        custom_id: MESSAGE.B_LINK_ACCOUNT,
        label    : 'Link Account(s)',
    } satisfies DButton;

// /* eslint-disable-next-line @typescript-eslint/require-await

export const buttonLinkAccount = async (body: IButton<typeof BUTTON_LINK_ACCOUNT>) => {
    await discord_itr.createModal(body.id, body.token, MODAL_LINK_ACCOUNT);
    return [];
};
