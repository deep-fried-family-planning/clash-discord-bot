import {Client} from 'clashofclans.js';
import {CFG, E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import {REDACTED_COC_KEY} from '#src/internal/constants/secrets.ts';
import {type ClashperkError, SlashUserError} from '#src/internal/errors.ts';
import {clashErrorFromUndefined} from '#src/internal/errors.ts';

export class Clashofclans extends E.Tag('DeepFryerClash')<
    Clashofclans,
    {
        [k in keyof Pick<
            Client,
            'verifyPlayerToken'
            | 'getClan'
            | 'getPlayer'
            | 'getPlayers'
            | 'getWars'
            | 'getClans'
            | 'getCurrentWar'
            | 'getClanWarLeagueGroup'
        >]: (...params: Parameters<Client[k]>) => E.Effect<Awaited<ReturnType<Client[k]>>, ClashperkError>
    }
    & {
        validateTag: (tag: string) => E.Effect<string, SlashUserError>;
    }
>() {
    static Live = L.effect(this, E.gen(function* () {
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

            getPlayers: (playerTag, options) => pipe(
                E.tryPromise(async () => await client.getPlayers(playerTag, options)),
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
}