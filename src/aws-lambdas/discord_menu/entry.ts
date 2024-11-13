import {UI} from 'dfx';
import {DiscordApi} from '#src/internals/layer-api/discord-api.ts';
import {makeMenu} from '#src/aws-lambdas/discord_menu/utils.ts';
import {LinkAccountStart} from '#src/aws-lambdas/discord_menu/menus/links.ts';

export const EntryLinks = makeMenu(UI.button, {
    custom_id: 'EntryLinks',
    options  : () => ({
        label: 'Links',
    }),
    handle: (ix, data) => DiscordApi.entryMenu(ix, {
        embeds: [{
            description: `entry-links\n${JSON.stringify(data, null, 2)}`,
        }],
        components: UI.grid([
            [LinkAccountStart.in()],
        ]),
    }),
});
