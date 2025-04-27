import type {CK_War} from '#src/clash/api-ck-get-previous-wars.ts';
import type {CK_Player_PreviousHits} from '#src/clash/api-ck-get-warhits.ts';
import {ingestCkWar} from '#src/internal/graph/pipeline/ingest-ck-wars.ts';
import type {DispatchedWar} from '#src/internal/graph/pipeline/ingest-types.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';

export const ingestCkPlayerPreviousWars = (playerPreviousHits: CK_Player_PreviousHits[]): DispatchedWar[] => pipe(
  playerPreviousHits,
  mapL((p): CK_War => ({
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
      members: pipe(p.attacks, mapL((a) => ({
        ...a.defender,
        bestOpponentAttack: p.attacks[0],
        attacks           : [a],
      }))),
    },
  })),
  mapL(ingestCkWar),
);
