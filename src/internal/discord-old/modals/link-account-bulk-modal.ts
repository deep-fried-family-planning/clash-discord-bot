import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/constants/route-kind.ts';
import {makeText} from '#src/internal/discord-old/components/make-text.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import {IXCTS} from '#src/internal/discord.ts';
import {UI} from 'dfx';



export const LINK_ACCOUNT_BULK_MODAL_OPEN   = toId({kind: RK_MODAL_OPEN, type: 'LAB'});
export const LINK_ACCOUNT_BULK_MODAL_SUBMIT = toId({kind: RK_MODAL_SUBMIT, type: 'LAB'});


export const BulkCSV = makeText({kind: RK_TEXT, type: 'PT'}, {
  label      : 'CSV',
  style      : IXCTS.PARAGRAPH,
  placeholder: 'discord_id, player_tag,',
});


export const LinkAccountBulkModal = {
  title     : 'Link Account',
  custom_id : LINK_ACCOUNT_BULK_MODAL_SUBMIT.custom_id,
  components: UI.singleColumn([
    BulkCSV.component,
  ]),
};
