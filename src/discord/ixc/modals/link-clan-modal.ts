import {Discord, UI} from 'dfx';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';


export const LINK_CLAN_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'LC'});
export const LINK_CLAN_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'LC'});


export const ClanTagT = makeText({kind: RDXK.TEXT, type: 'CT'}, {
    label      : 'Clan Tag',
    style      : Discord.TextInputStyle.SHORT,
    placeholder: 'check in-game clan profile',
});


export const LinkClanModal = {
    title     : 'Link Clan',
    custom_id : LINK_CLAN_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        ClanTagT.component,
    ]),
};
