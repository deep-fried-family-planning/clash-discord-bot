import {ingestCkToModel} from '#src/data/pipeline/ingest-ck.ts';
import {deriveModel} from '#src/data/pipeline/derive.ts';
import {accumulateWarData, optimizeGraphModel} from '#src/data/pipeline/optimize-graph-model.ts';
import {fetchWarEntities} from '#src/data/fetch-war-entities.ts';
import {filterL, flattenL, mapL, sortL} from '#src/pure/pure-list.ts';
import {findFirst} from 'effect/Array';
import type {ClanWarMember} from 'clashofclans.js';
import {fromCompare, OrdN} from '#src/pure/pure.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {Option} from 'effect';
import type {SharedOptions} from '#src/aws-lambdas/slash/types.ts';
import {ClashkingService} from '#src/internals/layers/clashking-service.ts';
import {DeepFryerUnknownError} from '#src/internals/errors/clash-error.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';

const sortMapPosition = sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition)));

export const buildGraphModel = (ops: SharedOptions) => E.gen(function * () {
    const entities = yield * fetchWarEntities(ops);

    if (!entities.currentWar.length) {
        return yield * new SlashUserError({issue: 'no current war found'});
    }

    const clashking = yield * ClashkingService;

    const cids = pipe(entities.current.clans, mapL((c) => c.tag));
    const pids = pipe(entities.current.players, mapL((p) => p.tag));

    const warCalls = pipe(
        cids,
        mapL((cid) => clashking.previousWars(cid, ops.limit)),
        E.allWith({concurrency: 'unbounded'}),
        E.map(flattenL),
    );

    const playerWarCalls = ops.exhaustive
        ? pipe(
            pids,
            mapL((p) => clashking.previousHits(p, ops.limit)),
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
