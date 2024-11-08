import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {concatL, filterL, flattenL, mapL, zipL} from '#src/pure/pure-list.ts';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {dEmpL, dHdr3, dLines, dSubC, nNatr, nNatT, nPrct} from '#src/discord/markdown.ts';
import {dTable} from '#src/discord/message-table.ts';
import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {Interaction} from '#src/discord/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {getAliasTag} from '#src/discord/get-alias-tag.ts';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {descriptiveHitRates} from '#src/data/model-descriptive/descriptive-hit-rates.ts';
import {validateServer} from '#src/aws-lambdas/slash/validation-utils.ts';
import {OPTION_CLAN, OPTION_EXHAUSTIVE, OPTION_FROM, OPTION_LIMIT, OPTION_TO} from '#src/aws-lambdas/slash/options.ts';

export const WA_MIRRORS = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-opponent',
    description: 'mirror-to-mirror comparison of our clan vs enemy clan with hit/defense rates',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
        ...OPTION_LIMIT,
        ...OPTION_EXHAUSTIVE,
    },
} as const;

export const waMirrors = (data: Interaction, ops: CmdOps<typeof WA_MIRRORS>) => E.gen(function * () {
    yield * validateServer(data);

    const clan = getAliasTag(ops.clan);

    const options = {
        cid1       : clan,
        from       : ops.from ?? 1,
        to         : ops.to ?? 50,
        showCurrent: false,
        showN      : false,
        exhaustive : ops.exhaustive ?? false,
        limit      : ops.limit ?? 50,
    };

    const graph = yield * buildGraphModel(options);

    const clanRates = descriptiveHitRates(graph.clanTag, graph.clanMembers, graph.model);
    const opponentRates = descriptiveHitRates(graph.opponentTag, graph.opponentMembers, graph.model);

    const [from, to] = [options.from, options.to];

    const rates = pipe(
        zipL(clanRates, opponentRates),
        filterL((_, idx) => idx >= from - 1 && idx <= to - 1),
    );

    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: pipe(
                [
                    dHdr3(`${graph.currentWar.clan.name} vs. ${graph.currentWar.opponent.name}`),
                ],
                concatL(pipe(
                    [
                        ['rk', 'th', ' % hr', ' % dr', 'name'],
                        [''],
                    ],
                    concatL(pipe(
                        rates,
                        mapL(([p1, p2], idx) => [
                            [nNatT(idx + from), nNatT(p1[0].townHallLevel), `${nPrct(p1[1][0])} n=${nNatr(p1[1][1])}`, `${nPrct(p1[2][0])} n=${nNatr(p1[2][1])}`, (p1[0].name)],
                            ['', nNatT(p2[0].townHallLevel), `${nPrct(p2[1][0])} n=${nNatr(p2[1][1])}`, `${nPrct(p2[2][0])} n=${nNatr(p2[2][1])}`, (p2[0].name)],
                            [''],
                        ]),
                        flattenL,
                    )),
                    dTable,
                    mapL((t, idx) => idx % 3 === 1
                        ? dEmpL()
                        : dSubC(t)),
                )),
                dLines,
            ).join(''),
        }],
    };
});
