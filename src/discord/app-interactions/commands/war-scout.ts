import type {COMMANDS} from '#src/discord/commands.ts';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {dBold, dCode, dHdr1, dLines, nNatr} from '#src/discord/helpers/markdown.ts';
import {describeScout} from '#src/data/model-descriptive/describe-scout.ts';
import {messageEmbedScout} from '#src/discord/command-util/message-embed-scout.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {describeSamples} from '#src/data/model-descriptive/describe-samples.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {toEntries} from 'effect/Record';
import {pipe} from '#src/utils/effect.ts';

export const warScout = specCommand<typeof COMMANDS.WAR_SCOUT>(async (body) => {
    const options = getSharedOptions(body);

    const graph = await buildGraphModel(options);
    const scout = describeScout(graph);

    const n_samples = describeSamples(graph.model);

    return {
        embeds: [{
            color      : nColor(COLOR.ORIGINAL),
            description: dLines([
                dHdr1(`${graph.currentWar.clan.name} War Scouting`),
                '',
                dBold('entity sample size'),
                ...pipe(n_samples, toEntries, mapL(([k, v]) => [k, nNatr(v)]), dTable, mapL(dCode)),
            ].flat()).join(''),
        }, {
            color      : nColor(COLOR.INFO),
            description: messageEmbedScout(scout).join(''),
        },
            // {
            //     desc: messageEmbedScoutRanks(scout),
            // },
        ],
    };
});
