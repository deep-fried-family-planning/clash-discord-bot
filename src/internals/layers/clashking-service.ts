import {bindApiCall} from '#src/internals/api-call.ts';
import {C, E, L, pipe, RL} from '#src/internals/re-exports/effect.ts';
import type {CK_War} from '#src/https/api-ck-get-previous-wars.ts';
import type {CK_Player_PreviousHits} from '#src/https/api-ck-get-warhits.ts';
import type {num} from '#src/pure/types-pure.ts';
import {DeepFryerUnknownError} from '#src/internals/errors/clash-error.ts';

export class ClashkingService extends C.Tag('DeepFryerClashkingService')<
    ClashkingService,
    {
        previousHits: (pid: string, limit: num) => E.Effect<CK_Player_PreviousHits[], DeepFryerUnknownError>;
        previousWars: (cid: string, limit: num) => E.Effect<CK_War[], DeepFryerUnknownError>;
    }
>() {}

export const ClashkingServiceLive = L.scoped(ClashkingService, E.gen(function* () {
    const api = bindApiCall('https://api.clashking.xyz');

    const rateLimit = yield * RL.make({
        limit   : 5,
        interval: '1 seconds',
    });

    return {
        previousHits: (pid, limit: num) => pipe(
            E.tryPromise(async () => {
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
            }),
            E.catchAllCause((d) => new DeepFryerUnknownError({original: d as unknown as Error})),
            E.catchAllDefect((d) => new DeepFryerUnknownError({original: d as Error})),
            rateLimit,
        ),

        previousWars: (cid: string, limit: num) => pipe(
            E.tryPromise(async () => {
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
            }),
            E.catchAllCause((d) => new DeepFryerUnknownError({original: d as unknown as Error})),
            E.catchAllDefect((d) => new DeepFryerUnknownError({original: d as Error})),
            rateLimit,
        ),
    };
}));
