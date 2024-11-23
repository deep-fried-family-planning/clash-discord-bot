import {UI} from 'dfx';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {PlayerTagT} from '#src/discord/ixc/modals/link-account-modal.ts';


export const LINK_ACCOUNT_MANAGE_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'LAM'});
export const LINK_ACCOUNT_MANAGE_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'LAM'});


export const LinkAccountModal = {
    title     : 'Admin Link Account',
    custom_id : LINK_ACCOUNT_MANAGE_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        PlayerTagT.component,
    ]),
};
