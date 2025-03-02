import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/constants/route-kind.ts';
import {makeText} from '#src/internal/discord-old/components/make-text.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import {IXCTS} from '#src/internal/discord.ts';
import {UI} from 'dfx';



export const LINK_ACCOUNT_MODAL_OPEN   = toId({kind: RK_MODAL_OPEN, component: 'LA'});
export const LINK_ACCOUNT_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, component: 'LA'});


export const PlayerTagT = makeText({kind: RK_TEXT, component: 'PT'}, {
  label      : 'Player Tag',
  style      : IXCTS.SHORT,
  placeholder: 'check in-game profile',
});
export const ApiTokenT  = makeText({kind: RK_TEXT, component: 'AT'}, {
  label      : 'API Token',
  style      : IXCTS.SHORT,
  placeholder: 'check in-game settings',
});


export const LinkAccountModal = {
  title     : 'Link Account',
  custom_id : LINK_ACCOUNT_MODAL_SUBMIT.custom_id,
  components: UI.singleColumn([
    PlayerTagT.component,
    ApiTokenT.component,
  ]),
};
