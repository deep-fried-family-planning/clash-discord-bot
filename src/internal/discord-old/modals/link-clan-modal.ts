import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/constants/route-kind.ts';
import {makeText} from '#src/internal/discord-old/components/make-text.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import {IXCTS} from '#src/internal/discord.ts';
import {UI} from 'dfx';



export const LINK_CLAN_MODAL_OPEN   = toId({kind: RK_MODAL_OPEN, component: 'LC'});
export const LINK_CLAN_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, component: 'LC'});


export const ClanTagT = makeText({kind: RK_TEXT, component: 'CT'}, {
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
