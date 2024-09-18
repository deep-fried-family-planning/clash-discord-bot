import {buildCommand} from '#src/discord/types.ts';
import {COMMANDS} from '#src/discord/commands.ts';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {dBold, dHdr1, dLines, nNatr} from '#src/discord/command-util/message.ts';
import {describeScout} from '#src/data/model-descriptive/describe-scout.ts';
import {messageEmbedScout} from '#src/discord/command-util/message-embed-scout.ts';
import {messageEmbedScoutRanks} from '#src/discord/command-util/message-embed-scout-ranks.ts';
import {pipe} from 'fp-ts/function';
import {toEntries} from 'fp-ts/Record';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {describeSamples} from '#src/data/model-descriptive/describe-samples.ts';
import {mapL} from '#src/data/pure-list.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';

export const warScout = buildCommand(COMMANDS.WAR_SCOUT, async (body) => {
    const options = getSharedOptions(body);

    const graph = await buildGraphModel(options);
    const scout = describeScout(graph);

    const n_samples = describeSamples(graph.model);

    return [{
        desc: dLines([
            dHdr1(`${graph.currentWar.clan.name} War Scouting`),
            '',
            dBold('entity sample size'),
            ...pipe(n_samples, toEntries, mapL(([k, v]) => [k, nNatr(v)]), dTable),
        ].flat()),
    }, {
        desc: messageEmbedScout(scout),
    },
    // {
    //     desc: messageEmbedScoutRanks(scout),
    // },
    ];
});
