import {AccountsB, AccountsChangeTypeSSS, AccountsDeleteSSS} from '#src/discord/ixc/links/accounts-components.ts';
import {E} from '#src/internal/pure/effect';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {UI} from 'dfx';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {IXCBS, type IxD, type IxDc} from '#src/discord/util/discord.ts';
import {GlobalCloseB} from '#src/discord/ixc/make/global.ts';


const populateAccounts = (ix: IxD, d: IxDc) => E.gen(function * () {
    const records = yield * queryPlayersForUser({pk: ix.member!.user!.id});
    const players = yield * Clashofclans.getPlayers(records.map((r) => r.sk));

    const lookup = players.reduce(
        (acc, player) => {
            acc[player.tag] = player;
            return acc;
        },
        emptyKV<string, typeof players[number]>(),
    );

    return {
        embed : jsonEmbed(d),
        select: {
            placeholder: 'Select Account',
            custom_id  : '',
            options    : records.map((r) => ({
                label      : `${lookup[r.sk].name} (${r.account_type})`,
                description: `[th${lookup[r.sk].townHallLevel}]: ${r.sk}`,
                value      : lookup[r.sk].tag,
            })),
        },
    };
});


export const AccountsBB = AccountsB.bind((ix, d, s) => E.gen(function * () {
    return {
        embeds    : [jsonEmbed(d)],
        components: UI.grid([
            [
                AccountsChangeTypeSSS.start.component,
                AccountsDeleteSSS.start.componentWith('', {style: IXCBS.DANGER}),
            ],
            [GlobalCloseB.component],
        ]),
    };
}));


export const AccountsChangeTypeSSSB = AccountsChangeTypeSSS.bind(
    AccountsBB.handler,
    AccountsBB.handler,
    (ix, d) => E.gen(function * () {

    }),
    populateAccounts,
);


export const AccountsDeleteSSSB = AccountsDeleteSSS.bind(
    AccountsBB.handler,
    AccountsBB.handler,
    (ix, d) => E.gen(function * () {

    }),
    populateAccounts,
);
