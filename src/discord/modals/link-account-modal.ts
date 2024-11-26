import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {makeText} from '#src/discord/components/make-text.ts';
import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/internal/constants/route-kind.ts';
import {IXCTS} from '#src/discord/util/discord.ts';


export const LINK_ACCOUNT_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'LA'});
export const LINK_ACCOUNT_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'LA'});


export const PlayerTagT = makeText({kind: RK_TEXT, type: 'PT'}, {
    label      : 'Player Tag',
    style      : IXCTS.SHORT,
    placeholder: 'check in-game profile',
});
export const ApiTokenT = makeText({kind: RK_TEXT, type: 'AT'}, {
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
