import {pipe} from 'fp-ts/function';
import {ingestCkToModel} from '#src/data/pipeline/ingest-ck.ts';
import {deriveModel} from '#src/data/pipeline/derive.ts';
import {accumulateWarData, optimizeGraphModel} from '#src/data/pipeline/optimize-graph-model.ts';
import {callCkWarsByClan} from '#src/data/api/api-ck-previous-wars.ts';
import {callCkWarsByPlayer} from '#src/data/api/api-ck-previous-hits.ts';
import type {SharedOptions} from '#src/discord/command-util/shared-options.ts';
import {fetchWarEntities} from '#src/discord/command-util/fetch-war-entities.ts';
import {filterL, mapL} from '#src/data/pure-list.ts';
import {findFirst} from 'fp-ts/Array';
import {toUndefined} from 'fp-ts/Option';
import {sortMapPosition} from '#src/data/api/api-coc.ts';

export const buildGraphModel = async (ops: SharedOptions) => {
    const entities = await fetchWarEntities(ops);

    const cids = pipe(entities.current.clans, mapL((c) => c.tag));
    const previousWars = await callCkWarsByClan(cids, ops.limit);

    const pids = pipe(entities.current.players, mapL((p) => p.tag));
    const previousWarsByPlayer = ops.exhaustive
        ? await callCkWarsByPlayer(pids, ops.limit)
        : [];

    const currentWar = pipe(
        entities.current.wars,
        findFirst((w) => !w.isWarEnded && w.isPreparationDay && [w.clan.tag, w.opponent.tag].includes(ops.cid1)),
        toUndefined,
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
};
