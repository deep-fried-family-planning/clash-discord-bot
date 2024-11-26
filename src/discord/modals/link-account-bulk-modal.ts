import {UI} from 'dfx';
import {toId} from '#src/discord/store/id-build.ts';
import {makeText} from '#src/discord/components/make-text.ts';
import {RK_MODAL_OPEN, RK_MODAL_SUBMIT, RK_TEXT} from '#src/internal/constants/route-kind.ts';
import {IXCTS} from '#src/discord/util/discord.ts';


export const LINK_ACCOUNT_BULK_MODAL_OPEN = toId({kind: RK_MODAL_OPEN, type: 'LAB'});
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
