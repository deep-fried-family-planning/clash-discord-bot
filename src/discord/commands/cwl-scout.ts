import {buildCommand} from '#src/discord/types.ts';
import {COMMANDS} from '#src/discord/commands.ts';
import {pipe} from 'fp-ts/function';
import {mapL} from '#src/data/pure-list.ts';
import {describeScout} from '#src/data/model-descriptive/describe-scout.ts';
import {messageEmbedScout} from '#src/discord/command-util/message-embed-scout.ts';
import {dBold, dCode, dHdr1, dLines, nNatr} from '#src/discord/command-util/message.ts';
import {describeSamples} from '#src/data/model-descriptive/describe-samples.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {toEntries} from 'fp-ts/Record';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';

export const cwlScout = buildCommand(COMMANDS.CWL_SCOUT, async (body) => {
    const options = getSharedOptions(body);
    const graph = await buildGraphModel(options);

    const scouts = pipe(
        graph.opponentClans,
        mapL((c) => describeScout({
            model          : graph.model,
            clan           : graph.clan,
            clanTag        : graph.clanTag,
            clanMembers    : [],
            currentWar     : graph.currentWar,
            opponent       : graph.opponent,
            opponentClans  : [],
            opponentTag    : c.tag,
            opponentMembers: c.members,
        })),
    );

    const n_samples = describeSamples(graph.model);

    return [{
        desc: dLines([
            dHdr1(`${graph.clan.name} CWL Scouting`),
            '',
            dBold('entity sample size'),
            pipe(n_samples, toEntries, mapL(([k, v]) => [k, nNatr(v)]), dTable, mapL(dCode)),
        ].flat()),
    }, ...scouts.map((s) => ({
        desc: messageEmbedScout(s),
    }))];
});
