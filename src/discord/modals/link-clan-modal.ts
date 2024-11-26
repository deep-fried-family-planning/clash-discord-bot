import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {makeText} from '#src/discord/components/make-text.ts';
import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/internal/constants/route-kind.ts';
import {IXCTS} from '#src/discord/util/discord.ts';


export const LINK_CLAN_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'LC'});
export const LINK_CLAN_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'LC'});


export const ClanTagT = makeText({kind: RK_TEXT, type: 'CT'}, {
    label      : 'Clan Tag',
    style      : IXCTS.SHORT,
    placeholder: 'check in-game clan profile',
});


export const LinkClanModal = {
    title     : 'Link Clan',
    custom_id : LINK_CLAN_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        ClanTagT.component,
    ]),
};
