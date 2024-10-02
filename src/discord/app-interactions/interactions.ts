import {MODAL_LINK_ACCOUNT, modalLinkAccount} from '#src/discord/app-interactions/components/modal-link-account.ts';
import {BUTTON_LINK_ACCOUNT, buttonLinkAccount} from '#src/discord/app-interactions/components/button-link-account.ts';
import {ITR} from '#src/discord/helpers/re-exports.ts';

export const COMP_INTERACTIONS = {
    [BUTTON_LINK_ACCOUNT.custom_id]: buttonLinkAccount,
};

export const MODAL_INTERACTIONS = {
    [MODAL_LINK_ACCOUNT.custom_id]: modalLinkAccount,
};

export const INTERACTIONS = {
    [ITR.MessageComponent]: COMP_INTERACTIONS,
    [ITR.ModalSubmit]     : MODAL_INTERACTIONS,
};
