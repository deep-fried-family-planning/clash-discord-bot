import {Client} from 'clashofclans.js';
import {C, CFG, E, L, RDT} from '#src/internals/re-exports/effect.ts';
import {REDACTED_COC_KEY} from '#src/internals/constants/secrets.ts';
import type {ClashError} from '#src/internals/errors/clash-error.ts';
import {clashErrorFromUndefined} from '#src/internals/errors/clash-error.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';

export class ClashService extends C.Tag('DeepFryerClash')<
    ClashService,
    {
        [k in keyof Pick<
            Client,
            'verifyPlayerToken'
            | 'getClan'
            | 'getPlayer'
            | 'getWars'
            | 'getClans'
            | 'getCurrentWar'
            | 'getClanWarLeagueGroup'
        >]: (...params: Parameters<Client[k]>) => E.Effect<Awaited<ReturnType<Client[k]>>, ClashError>
    }
    & {
        validateTag: (tag: string) => E.Effect<string, SlashUserError>;
    }
>() {}

export const ClashLive = L.effect(ClashService, E.gen(function* () {
    const apiKey = RDT.value(yield * CFG.redacted(REDACTED_COC_KEY));

    const client = new Client({
        baseURL: 'https://cocproxy.royaleapi.dev',
        keys   : [apiKey],
    });

    return {
        verifyPlayerToken: (playerTag, options) => E
            .tryPromise(
                async () => await client.verifyPlayerToken(playerTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getPlayer: (playerTag, options) => E
            .tryPromise(
                async () => await client.getPlayer(playerTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getClan: (clanTag, options) => E
            .tryPromise(
                async () => await client.getClan(clanTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getClans: (clanTag, options) => E
            .tryPromise(
                async () => await client.getClans(clanTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getCurrentWar: (clanTag, options) => E
            .tryPromise(
                async () => await client.getCurrentWar(clanTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getWars: (clanTag, options) => E
            .tryPromise(
                async () => await client.getWars(clanTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        getClanWarLeagueGroup: (clanTag, options) => E
            .tryPromise(
                async () => await client.getClanWarLeagueGroup(clanTag, options),
            )
            .pipe(
                E.catchAll(clashErrorFromUndefined),
            ),

        validateTag: (tag) => {
            const formatted
                    = `#${tag.toUpperCase().replace(/O/g, '0').replace(/^#/g, '').replace(/\s/g, '')}`;

            if (/^#?[0289PYLQGRJCUV]$/.test(formatted)) {
                return E.fail(new SlashUserError({issue: 'Invalid tag provided.'}));
            }

            return E.succeed(formatted);
        },
    };
}));
