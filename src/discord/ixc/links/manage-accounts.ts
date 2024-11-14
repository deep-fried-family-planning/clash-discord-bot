import {UI} from 'dfx';
import {ButtonStyle} from 'dfx/types';
import {E} from '#src/internal/pure/effect.ts';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {makeMenu} from '#src/discord/ixc/ixc-make.ts';
import {Back, Close} from '#src/discord/ixc/ixc-utils.ts';

export const ManageAccounts = makeMenu('ManageAccounts', UI.button, {
    label: 'Accounts',
    style: ButtonStyle.SECONDARY,
},
(ix, data) => E.gen(function * () {
    const players = yield * queryPlayersForUser({pk: ix.member!.user!.id});
    const tags = players.map((p) => p.sk);

    const apiPlayers = yield * Clashofclans.getPlayers(tags);

    return {
        embeds: [{
            description: JSON.stringify(data, null, 2),
        }],
        components: UI.grid([
            [SelectAccount.with('', {
                options: apiPlayers.map((p, idx) => ({
                    label      : p.name,
                    value      : p.tag,
                    description: `[th${p.townHallLevel}]: ${players[idx].account_type}`,
                })),
            })],
            [Back.built, Close.built],
        ]),
    };
}));


export const SelectAccount = makeMenu('SelectAccount', UI.select, {
    placeholder: 'Select Account',
},
() => E.gen(function * () {
    return undefined;
}));


export const DeleteAccount = makeMenu('DeleteAccount', UI.select, {
    placeholder: 'Select Account',
},
() => E.gen(function * () {
    return undefined;
}));
