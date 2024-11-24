import {Discord, UI} from 'dfx';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {makeText} from '#src/discord/ixc/components/make-text.ts';


export const LINK_ACCOUNT_BULK_MODAL_OPEN = toId({kind: RDXK.MODAL_OPEN, type: 'LAB'});
export const LINK_ACCOUNT_BULK_MODAL_SUBMIT = toId({kind: RDXK.MODAL_SUBMIT, type: 'LAB'});


export const BulkCSV = makeText({kind: RDXK.TEXT, type: 'PT'}, {
    label      : 'CSV',
    style      : Discord.TextInputStyle.SHORT,
    placeholder: 'discord_id, player_tag,',
});


export const LinkAccountBulkModal = {
    title     : 'Link Account',
    custom_id : LINK_ACCOUNT_BULK_MODAL_SUBMIT.custom_id,
    components: UI.singleColumn([
        BulkCSV.component,
    ]),
};
