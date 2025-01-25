import {clashErrorFromUndefined, type ClashperkError, SlashUserError} from '#src/internal/errors.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {Client} from 'clashofclans.js';



type ClashClient = {
                     [k in keyof Pick<
    Client,
    'verifyPlayerToken'
    | 'getClan'
    | 'getPlayer'
    | 'getPlayers'
    | 'getClanWar'
    | 'getWars'
    | 'getClans'
    | 'getCurrentWar'
    | 'getClanWarLeagueGroup'
  >]: (...params: Parameters<Client[k]>) => E.Effect<Awaited<ReturnType<Client[k]>>, ClashperkError>
                   } & {
                     validateTag: (tag: string) => E.Effect<string, SlashUserError>;
                   };


const program = E.gen(function * () {
  const client = new Client({
    baseURL: 'https://cocproxy.royaleapi.dev',
    keys   : [process.env.DFFP_COC_KEY],
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

    getClanWar: (clanTag, options) => E
      .tryPromise(
        async () => await client.getClanWar(clanTag, options),
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
  } as ClashClient;
});


export class ClashOfClans extends E.Tag('ClashOfClans')<ClashOfClans, ClashClient>() {
  static Live = L.effect(this, program);
}
