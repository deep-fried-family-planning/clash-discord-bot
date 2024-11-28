import type {Player} from 'clashofclans.js';
import type {DispatchedWar} from '#src/internal/graph/pipeline/ingest-types.ts';
import {ingestCkPlayerPreviousWars} from '#src/internal/graph/pipeline/ingest-ck-player-previous-wars.ts';
import {ingestCkWar} from '#src/internal/graph/pipeline/ingest-ck-wars.ts';
import type {IDKV} from '#src/internal/graph/types.ts';
import {attachModelId} from '#src/internal/graph/types.ts';
import type {CK_Player_PreviousHits} from '#src/clash/api-ck-get-warhits.ts';
import type {CK_War} from '#src/clash/api-ck-get-previous-wars.ts';
import {toEntries} from 'effect/Record';
import {pipe} from '#src/internal/pure/effect.ts';
import {concatL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';

export const ingestCkToModel = (prevWars: CK_War[], players?: Player[], playerPrevious?: CK_Player_PreviousHits[]) => {
    console.log('[INGEST]: starting...');

    const wars = pipe(prevWars, mapL(ingestCkWar));

    if (players && playerPrevious) {
        console.log('[INGEST]: complete');

        return attachModelId({
            wars: pipe(
                ingestCkPlayerPreviousWars(playerPrevious),
                concatL(wars),
                reduceL({} as IDKV<DispatchedWar>, (acc, w) => {
                    const ordered = [w.clans[0].cid, w.clans[1].cid].sort();
                    const key = `${ordered[0]}_${ordered[1]}`;

                    if (key in acc) {
                        acc[key] = w.hits.length > acc[key].hits.length
                            ? w
                            : acc[key];
                    }
                    else {
                        acc[key] = w;
                    }

                    return acc;
                }),
                toEntries,
                mapL(([, w]) => w),
            ),
            current: {
                players: players,
            },
        });
    }

    console.log('[INGEST]: complete');

    return attachModelId({
        wars,
        current: {
            players: [],
        },
    });
};
