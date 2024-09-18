import {pipe} from 'fp-ts/function';
import {concat, map, reduce} from 'fp-ts/Array';
import type {Player} from 'clashofclans.js';
import type {DispatchedWar} from '#src/data/pipeline/ingest-types.ts';
import {ingestCkPlayerPreviousWars} from '#src/data/pipeline/ingest-ck-player-previous-wars.ts';
import {toArray} from 'fp-ts/Record';
import {ingestCkWar} from '#src/data/pipeline/ingest-ck-wars.ts';
import type {IDKV} from '#src/data/types.ts';
import {attachModelId} from '#src/data/types.ts';
import type {CK_Player_PreviousHits} from '#src/data/api/api-ck-previous-hits.ts';
import type {CK_War} from '#src/data/api/api-ck-previous-wars.ts';
import console from 'node:console';

export const ingestCkToModel = (prevWars: CK_War[], players?: Player[], playerPrevious?: CK_Player_PreviousHits[]) => {
    console.log('[INGEST]: starting...');

    const wars = pipe(prevWars, map(ingestCkWar));

    if (players && playerPrevious) {
        console.log('[INGEST]: complete');

        return attachModelId({
            wars: pipe(
                ingestCkPlayerPreviousWars(playerPrevious),
                concat(wars),
                reduce({} as IDKV<DispatchedWar>, (acc, w) => {
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
                toArray,
                map(([, w]) => w),
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
