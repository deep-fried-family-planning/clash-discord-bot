import type {DispatchedWar} from '#src/data/pipeline/ingest-types.ts';
import {pipe} from 'fp-ts/function';
import {map} from 'fp-ts/Array';
import {ingestCkWar} from '#src/data/pipeline/ingest-ck-wars.ts';
import type {CK_Player_PreviousHits} from '#src/data/api/api-ck-previous-hits.ts';
import type {CK_War} from '#src/data/api/api-ck-previous-wars.ts';

export const ingestCkPlayerPreviousWars = (playerPreviousHits: CK_Player_PreviousHits[]): DispatchedWar[] => pipe(
    playerPreviousHits,
    map((p): CK_War => ({
        ...p.war_data,
        battleModifier : '',
        status_code    : 200,
        timestamp      : 0,
        _response_retry: 120,
        clan           : {
            ...p.war_data.clan,
            members: [{
                ...p.member_data,
                bestOpponentAttack: p.defenses[0],
                attacks           : p.attacks,
            }],
        },
        opponent: {
            ...p.war_data.opponent,
            members: pipe(p.attacks, map((a) => ({
                ...a.defender,
                bestOpponentAttack: p.attacks[0],
                attacks           : [a],
            }))),
        },
    })),
    map(ingestCkWar),
);
