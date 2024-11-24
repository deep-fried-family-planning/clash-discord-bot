import {UI} from 'dfx';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {PlayerTagT} from '#src/discord/ixc/modals/link-account-modal.ts';


export const LINK_ACCOUNT_ADMIN_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'LAA'});
export const LINK_ACCOUNT_ADMIN_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'LAA'});


export const LinkAccountAdminModal = {
    title     : 'Admin Link Account',
    custom_id : LINK_ACCOUNT_ADMIN_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        PlayerTagT.component,
    ]),
};
