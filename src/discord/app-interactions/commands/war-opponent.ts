import {descriptiveHitRates} from '#src/data/model-descriptive/descriptive-hit-rates.ts';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {concatL, filterL, flattenL, mapL, zipL} from '#src/pure/pure-list.ts';
import {
    dEmpL,
    dHdr3,
    dLines,
    dSubC,
    nNatT,
    nNatr,
    nPrct,
} from '#src/discord/helpers/markdown.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {pipe} from '#src/utils/effect.ts';
import type {WAR_OPPONENT} from '#src/discord/app-interactions/commands/war-opponent.cmd.ts';

export const warOpponent = specCommand<typeof WAR_OPPONENT>(async (body) => {
    const options = getSharedOptions(body);

    const graph = await buildGraphModel(options);

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
