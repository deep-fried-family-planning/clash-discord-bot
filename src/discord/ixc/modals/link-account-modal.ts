import {Discord, UI} from 'dfx';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';


export const LINK_ACCOUNT_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN_FORWARD, type: 'LA'});
export const LINK_ACCOUNT_MODAL_FORWARD = toId({kind: RDXK.MODAL_SUBMIT_FORWARD, type: 'LA'});


export const PlayerTagT = makeText({kind: RDXK.TEXT, type: 'PT'}, {
    label      : 'Player Tag',
    style      : Discord.TextInputStyle.SHORT,
    placeholder: 'check in-game profile',
});
export const ApiTokenT = makeText({kind: RDXK.TEXT, type: 'AT'}, {
    label      : 'API Token',
    style      : Discord.TextInputStyle.SHORT,
    placeholder: 'check in-game settings',
});


export const LinkAccountModal = {
    title     : 'Link Account',
    custom_id : LINK_ACCOUNT_MODAL_FORWARD.custom_id,
    components: UI.singleColumn([
        PlayerTagT.component,
        ApiTokenT.component,
    ]),
};
