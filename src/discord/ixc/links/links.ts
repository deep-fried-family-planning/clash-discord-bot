import {UI} from 'dfx';
import {LinkAccountStart} from '#src/discord/ixc/links/link-account.ts';
import {ManageAccounts} from '#src/discord/ixc/links/manage-accounts.ts';
import {ManageUser} from '#src/discord/ixc/links/manage-user.ts';
import {Refresh} from '#src/discord/ixc/links/refresh.ts';
import {makeEntryMenu} from '#src/discord/ixc/ixc-make.ts';
import {ButtonStyle} from 'dfx/types';
import {E} from '#src/internal/pure/effect.ts';

export const EntryLinks = makeEntryMenu('EntryLinks', UI.button, {
    label: 'Link',
    style: ButtonStyle.SUCCESS,
},
(ix, data) => E.gen(function * () {
    return {
        embeds: [{
            description: JSON.stringify(data, null, 2),
        }],
        components: UI.grid([
            [LinkAccountStart.built, ManageAccounts.built],
            [Refresh.built, ManageUser.built],
        ]),
    };
}));
