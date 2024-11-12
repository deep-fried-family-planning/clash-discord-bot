import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {describeScout} from '#src/data/model-descriptive/describe-scout.ts';
import {describeSamples} from '#src/data/model-descriptive/describe-samples.ts';
import {dBold, dCode, dHdr1, dLines, nNatr} from '#src/aws-lambdas/discord_menu/old/markdown.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {toEntries} from 'effect/Record';
import {mapL} from '#src/pure/pure-list.ts';
import {dTable} from '#src/aws-lambdas/discord_menu/old/message-table.ts';
import {messageEmbedScout} from '#src/aws-lambdas/slash/messages/message-embed-scout.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/aws-lambdas/discord_menu/old/types.ts';
import {getAliasTag} from '#src/aws-lambdas/discord_menu/old/get-alias-tag.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {OPTION_CLAN, OPTION_EXHAUSTIVE, OPTION_LIMIT} from '#src/aws-lambdas/slash/options.ts';
import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';

export const WA_SCOUT
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'wa-scout',
        description: 'learn enemy clan behaviors and capabilities through a range of war statistics',
        options    : {
            ...OPTION_CLAN,
            ...OPTION_LIMIT,
            ...OPTION_EXHAUSTIVE,
        },
    } as const satisfies CommandSpec;

export const waScout = (data: CmdIx, ops: CmdOps<typeof WA_SCOUT>) => E.gen(function * () {
    yield * validateServer(data);

    const clan = getAliasTag(ops.clan);

    const graph = yield * buildGraphModel({
        cid1       : clan,
        exhaustive : Boolean(ops.exhaustive),
        from       : 1,
        to         : 50,
        limit      : ops.limit ?? 50,
        showCurrent: false,
        showN      : false,
    });

    const n_samples = describeSamples(graph.model);
    const scout = describeScout(graph);

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
        }],
    };
});
