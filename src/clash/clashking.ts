import {ClashKingEnv} from 'config/external.ts';
import {bindApiCall} from '#src/clash/api-call.ts';
import type {CK_War} from '#src/clash/api-ck-get-previous-wars.ts';
import type {CK_Player_PreviousHits} from '#src/clash/api-ck-get-warhits.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {num} from '#src/internal/pure/types-pure.ts';
import {Data, Duration, RateLimiter} from 'effect';

type ClashKingClient = {
  previousHits: (pid: string, limit: num) => E.Effect<CK_Player_PreviousHits[], ClashKingError>;
  previousWars: (cid: string, limit: num) => E.Effect<CK_War[], ClashKingError>;
};

export class ClashKingError extends Data.TaggedError('ClashKingError')<{
  cause?: any;
}> {}

export class ClashKing extends E.Service<ClashKing>()('deepfryer/ClashKing', {
  scoped: E.gen(function* () {
    const env = yield* ClashKingEnv;

    const rateLimit = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      limit    : env.DFFP_CLASHKING_LIMIT_RPS,
      interval : Duration.seconds(1),
    });

    const rateLimitHistoric = yield* RateLimiter.make({
      algorithm: 'fixed-window',
      limit    : env.DFFP_CLASHKING_LIMIT_HISTORIC_RPS,
      interval : Duration.seconds(1),
    });

    const api = bindApiCall(env.DFFP_CLASHKING_URL);

    return {
      previousHits: (pid, limit: num) =>
        E.promise(async () => {
          const data = await api<{items: CK_Player_PreviousHits[]}>({
            method: 'GET',
            path  : `/player/${encodeURIComponent(pid)}/warhits`,
            query : {
              timestamp_start: 0,
              timestamp_end  : 2527625513,
              limit          : limit,
            },
          });

          return data.contents.items;
        }).pipe(
          E.catchAllDefect((cause) => new ClashKingError({cause})),
          rateLimitHistoric,
        ),

      previousWars: (cid: string, limit: num) =>
        E.promise(async () => {
          const data = await api<CK_War[]>({
            method: 'GET',
            path  : `/war/${encodeURIComponent(cid)}/previous`,
            query : {
              timestamp_start: 0,
              timestamp_end  : 9999999999,
              limit          : limit,
            },
          });

          return data.contents;
        }).pipe(
          E.catchAllDefect((cause) => new ClashKingError({cause})),
          rateLimitHistoric,
        ),
    } as ClashKingClient;
  }),
  accessors: true,
}) {}
