import {ingestCkToModel} from '#src/data/pipeline/ingest-ck.ts';
import {deriveModel} from '#src/data/pipeline/derive.ts';
import {accumulateWarData, optimizeGraphModel} from '#src/data/pipeline/optimize-graph-model.ts';
import {callCkWarsByClan} from '#src/https/calls/api-ck-get-previous-wars.ts';
import {callCkWarsByPlayer} from '#src/https/calls/api-ck-get-warhits.ts';
import type {SharedOptions} from '#src/discord/command-util/shared-options.ts';
import {fetchWarEntities, type WarEntities} from '#src/discord/command-util/fetch-war-entities.ts';
import {filterL, mapL, sortL} from '#src/pure/pure-list.ts';
import {findFirst} from 'effect/Array';
import {notFound} from '@hapi/boom';
import type {ClanWarMember} from 'clashofclans.js';
import {fromCompare, OrdN} from '#src/pure/pure.ts';
import {pipe} from '#src/internals/re-exports/effect.ts';
import {Option} from 'effect';

const sortMapPosition = sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition)));

export const buildGraphModel = async (ops: SharedOptions, inentities?: WarEntities) => {
    const entities = inentities ?? await fetchWarEntities(ops);

    if (!entities.currentWar.length) {
        throw notFound('no current war found');
    }

    const cids = pipe(entities.current.clans, mapL((c) => c.tag));
    const previousWars = await callCkWarsByClan(cids, ops.limit);

    const pids = pipe(entities.current.players, mapL((p) => p.tag));
    const previousWarsByPlayer = ops.exhaustive
        ? await callCkWarsByPlayer(pids, ops.limit)
        : [];

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
};
