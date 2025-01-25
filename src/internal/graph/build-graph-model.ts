import {ClashKing} from '#src/clash/clashking.ts';
import type {SharedOptions} from '#src/discord/types.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {fetchWarEntities} from '#src/internal/graph/fetch-war-entities.ts';
import {deriveModel} from '#src/internal/graph/pipeline/derive.ts';
import {ingestCkToModel} from '#src/internal/graph/pipeline/ingest-ck.ts';
import {accumulateWarData, optimizeGraphModel} from '#src/internal/graph/pipeline/optimize-graph-model.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {filterL, flattenL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {Option} from 'effect';
import {findFirst} from 'effect/Array';



const sortMapPosition = sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition)));

export const buildGraphModel = (ops: SharedOptions) => E.gen(function * () {
  const entities = yield * fetchWarEntities(ops);

  if (!entities.currentWar.length) {
    return yield * new SlashUserError({issue: 'no current war found'});
  }

  const cids = pipe(entities.current.clans, mapL((c) => c.tag));
  const pids = pipe(entities.current.players, mapL((p) => p.tag));

  const warCalls = pipe(
    cids,
    mapL((cid) => ClashKing.previousWars(cid, ops.limit)),
    E.allWith({concurrency: 'unbounded'}),
    E.map(flattenL),
  );

  const playerWarCalls = ops.exhaustive
    ? pipe(
      pids,
      mapL((p) => ClashKing.previousHits(p, ops.limit)),
      E.allWith({concurrency: 'unbounded'}),
      E.map(flattenL),
    )
    : E.succeed([]);

  const [previousWars, previousWarsByPlayer] = yield * pipe(
    [warCalls, playerWarCalls] as const,
    E.allWith({concurrency: 'unbounded'}),
  );

  const currentWar = pipe(
    entities.current.wars,
    findFirst((w) => !w.isWarEnded && !(w.isCWL && w.isBattleDay) && [w.clan.tag, w.opponent.tag].includes(ops.cid1)),
    Option.getOrUndefined,
  )!;

  const [clan, opponent] = currentWar.clan.tag === ops.cid1
    ? [currentWar.clan, currentWar.opponent]
    : [currentWar.opponent, currentWar.clan];

  return {
    model: pipe(
      ingestCkToModel(previousWars, entities.current.players, previousWarsByPlayer),
      deriveModel,
      accumulateWarData,
      optimizeGraphModel,
    ),
    clan,
    clanTag        : ops.cid1,
    clanMembers    : pipe(clan.members, sortMapPosition),
    opponent,
    opponentTag    : opponent.tag,
    opponentMembers: pipe(opponent.members, sortMapPosition),
    currentWar,
    opponentClans  : pipe(
      entities.current.wars,
      filterL((w) => !w.isWarEnded && w.isPreparationDay),
      mapL((w) => w.clan),
    ),
  };
});
