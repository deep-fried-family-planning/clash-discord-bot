import {RK_MODAL_OPEN, RK_MODAL_SUBMIT} from '#src/constants/route-kind.ts';
import {PlayerTagT} from '#src/internal/discord-old/modals/link-account-modal.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import {UI} from 'dfx';

export const LINK_ACCOUNT_ADMIN_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'LAA'});
export const LINK_ACCOUNT_ADMIN_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'LAA'});

export const LinkAccountAdminModal = {
  title     : 'Admin Link Account',
  custom_id : LINK_ACCOUNT_ADMIN_MODAL_SUBMIT.custom_id,
  components: UI.singleColumn([
    PlayerTagT.component,
  ]),
};
