import {UI} from 'dfx';
import {DiscordApi} from '#src/internals/layer-api/discord-api.ts';
import {makeMenu} from '#src/aws-lambdas/discord_menu/utils.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {ButtonStyle} from 'dfx/types';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';

export const LinkAccountStart = makeMenu(UI.button, {
    custom_id: 'LinkAccountStart',
    options  : () => ({
        label: 'Links',
    }),
    handle: (ix, data) => DiscordApi.editMenu(ix.application_id, ix.token, {
        embeds: [{
            description: JSON.stringify(data, null, 2),
        }],
        components: UI.grid([
            [ModalLinkAccount.in(), ManageAccounts.in()],
            [RefreshAccounts.in(), ManageUser.in()],
        ]),
    }),
});

export const ModalLinkAccount = makeMenu(UI.button, {
    custom_id: 'ModalLinkAccount',
    options  : () => ({
        label: 'Link Account',
        style: ButtonStyle.SUCCESS,
    }),
    handle: () => E.void,
});

export const RefreshAccounts = makeMenu(UI.button, {
    custom_id: 'RefreshAccounts',
    options  : () => ({
        label: 'Refresh',
    }),
    handle: () => E.void,
});

export const ManageAccounts = makeMenu(UI.button, {
    custom_id: 'ManageAccounts',
    options  : () => ({
        label: 'Accounts',
        style: ButtonStyle.SECONDARY,
    }),
    handle: (ix, data) => E.gen(function * () {
        const players = yield * queryPlayersForUser({pk: ix.member!.user.id});
        const tags = players.map((p) => p.sk);

        const apiPlayers = yield * Clashofclans.getPlayers(tags);

        yield * DiscordApi.editMenu(ix.application_id, ix.token, {
            embeds: [{
                description: `entry-links\n${JSON.stringify(data, null, 2)}`,
            }],
            components: UI.grid([
                [SelectAccount.in({
                    options: apiPlayers.map((p, idx) => ({
                        label      : p.name,
                        value      : p.tag,
                        description: `[th${p.townHallLevel}]: ${players[idx].account_type}`,
                    })),
                })],
            ]),
        });
    }),
});

export const SelectAccount = makeMenu(UI.select, {
    custom_id: 'SelectAccount',
    options  : (ops) => ({
        ...ops,
        label: 'Select Account',
    }),
    handle: () => E.void,
});

export const ManageUser = makeMenu(UI.button, {
    custom_id: 'ManageUser',
    options  : () => ({
        label: 'User',
        style: ButtonStyle.SECONDARY,
    }),
    handle: (ix, data) => DiscordApi.editMenu(ix.application_id, ix.token, {
        embeds: [{
            description: `entry-links\n${JSON.stringify(data, null, 2)}`,
        }],
        components: UI.grid([
            [EditTimezone.in()],
            [EditQuietStart.in()],
            [EditQuietEnd.in()],
            [UI.channelSelect({
                custom_id: 'channels',
            })],
            [UI.mentionableSelect({
                custom_id: 'mentionable',
            })],
        ]),
    }),
});

export const EditTimezone = makeMenu(UI.select, {
    custom_id: 'EditTimezone',
    options  : () => ({
        options: [
            {label: 'America/New_York', value: 'America/New_York'},
            {label: 'America/Chicago', value: 'America/Chicago'},
            {label: 'America/Los_Angeles', value: 'America/Los_Angeles'},
            {label: 'Asia/Calcutta', value: 'Asia/Calcutta'},
            {label: 'Asia/Manila', value: 'Asia/Manila'},
            {label: 'Europe/London', value: 'Europe/London'},
            {label: 'Europe/Paris', value: 'Europe/Paris'},
            {label: 'Asia/Riyadh', value: 'Asia/Riyadh'},
            {label: 'Asia/Dubai', value: 'Asia/Dubai'},
            {label: 'Africa/Johannesburg', value: 'Africa/Johannesburg'},
            {label: 'Asia/Tokyo', value: 'Asia/Tokyo'},
        ],
    }),
    handle: () => E.void,
});

export const EditQuietStart = makeMenu(UI.select, {
    custom_id: 'EditQuietStart',
    options  : () => ({
        options: Array(24).fill(0).map((_, idx) => ({
            label: `${idx.toString().padStart(2, '0')}:00`,
            value: `${idx.toString().padStart(2, '0')}:00`,
        })),
    }),
    handle: () => E.void,
});

export const EditQuietEnd = makeMenu(UI.select, {
    custom_id: 'EditQuietEnd',
    options  : () => ({
        options: Array(24).fill(0).map((_, idx) => ({
            label: `${idx.toString().padStart(2, '0')}:00`,
            value: `${idx.toString().padStart(2, '0')}:00`,
        })),
    }),
    handle: () => E.void,
});
