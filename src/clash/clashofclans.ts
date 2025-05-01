import {ClashEnv} from '#config/external.ts';
import {RestCache} from '#src/clash/layers/restcache.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Client, type Player} from 'clashofclans.js';
import {Data, Redacted} from 'effect';

type Keys = | 'verifyPlayerToken'
            | 'getClan'
            | 'getPlayer'
            | 'getPlayers'
            | 'getClanWar'
            | 'getWars'
            | 'getClans'
            | 'getCurrentWar'
            | 'getClanWarLeagueGroup';

type ClashClient =
  {
    [k in keyof Pick<Client, Keys>]: (...params: Parameters<Client[k]>) => E.Effect<Awaited<ReturnType<Client[k]>>, ClashOfClansError>
  }
  & {
    validateTag: (tag: string) => E.Effect<string, SlashUserError>;
  };

export class ClashOfClansError extends Data.TaggedError('ClashOfClansError')<{
  cause?: any;
}> {}

export class ClashOfClans extends E.Service<ClashClient>()('deepfryer/ClashOfClans', {
  scoped: E.gen(function* () {
    const env = yield* ClashEnv;

    const client = new Client({
      baseURL: env.DFFP_COC_URL,
      keys   : [Redacted.value(env.DFFP_COC_KEY)],
    });

    const cache = yield* RestCache;

    return {
      validateTag: (tag) => {
        const formatted = `#${tag.toUpperCase().replace(/O/g, '0').replace(/^#/g, '').replace(/\s/g, '')}`;

        if (/^#?[0289PYLQGRJCUV]$/.test(formatted)) {
          return E.fail(new SlashUserError({issue: 'Invalid tag provided.'}));
        }

        return E.succeed(formatted);
      },

      verifyPlayerToken: (playerTag, options) =>
        E.promise(
          async () => await client.verifyPlayerToken(playerTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getPlayer: (playerTag, options) =>
        pipe(
          cache.get(playerTag),
          E.flatMap((cached) => {
            if (cached) return E.succeed(cached.data as Player);
            return E.promise(
              async () => await client.getPlayer(playerTag, options),
            ).pipe(
              E.catchAllDefect((cause) => new ClashOfClansError({cause})),
              E.tap((player) => cache.set(playerTag, player)),
            );
          }),
        ),

      getPlayers: (playerTag, options) =>
        E.promise(
          async () => await client.getPlayers(playerTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getClan: (clanTag, options) =>
        E.promise(
          async () => await client.getClan(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getClans: (clanTag, options) =>
        E.promise(
          async () => await client.getClans(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getClanWar: (clanTag, options) =>
        E.promise(
          async () => await client.getClanWar(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getCurrentWar: (clanTag, options) =>
        E.promise(
          async () => await client.getCurrentWar(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getWars: (clanTag, options) =>
        E.promise(
          async () => await client.getWars(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

      getClanWarLeagueGroup: (clanTag, options) =>
        E.promise(
          async () => await client.getClanWarLeagueGroup(clanTag, options),
        ).pipe(
          E.catchAllDefect((cause) => new ClashOfClansError({cause})),
        ),

    } as ClashClient;
  }),
  dependencies: [RestCache.Live],
  accessors   : true,
}) {}
