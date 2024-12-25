import {bindApiCall} from '#src/clash/api-call.ts';
import type {CK_War} from '#src/clash/api-ck-get-previous-wars.ts';
import type {CK_Player_PreviousHits} from '#src/clash/api-ck-get-warhits.ts';
import {DeepFryerUnknownError} from '#src/internal/errors.ts';
import {E, L, pipe, RL} from '#src/internal/pure/effect.ts';
import type {num} from '#src/internal/pure/types-pure.ts';


type ClashKingClient = {
    previousHits: (pid: string, limit: num) => E.Effect<CK_Player_PreviousHits[], DeepFryerUnknownError>;
    previousWars: (cid: string, limit: num) => E.Effect<CK_War[], DeepFryerUnknownError>;
};


const rate = RL.make({
    limit   : 5,
    interval: '1 seconds',
});


const program = E.gen(function* () {
    const api = bindApiCall('https://api.clashking.xyz');
    const rateLimit = yield * rate;

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
    } as ClashKingClient;
});


export class ClashKing extends E.Tag('ClashKingService')<ClashKing, ClashKingClient>() {
    static Live = L.scoped(this, program);
}
