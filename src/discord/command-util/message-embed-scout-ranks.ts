import {dHdr3, dLines, dSubC, nNatr, nNatT, nPrct} from '#src/discord/command-util/message.ts';
import {pipe} from 'fp-ts/function';
import {concatL, mapL} from '#src/data/pure-list.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import type {describeScout} from '#src/data/model-descriptive/describe-scout.ts';

export const messageEmbedScoutRanks = (scout: ReturnType<typeof describeScout>, nshow?: boolean) => {
    return nshow
        ? dLines([
            dHdr3(`Rank Analysis n=${scout.wars.length} wars`),
            pipe(
                [
                    ['rk', 'th', 'hit', 'def', 'name'],
                ],
                concatL(pipe(
                    scout.hitRates,
                    mapL(([p, hr, dr]) => [nNatT(p.mapPosition), nNatT(p.townHallLevel), nPrct(hr[0]), nPrct(dr[0]), ((p.name))]),
                )),
                dTable,
                mapL(dSubC),
            ),
        ].flat())
        : dLines([
            dHdr3(`Rank Analysis n=${scout.wars.length} wars`),
            pipe(
                [
                    ['rk', 'th', 'r% hit', 'r% def', 'name'],
                ],
                concatL(pipe(
                    scout.hitRates,
                    mapL(([p, hr, dr]) => [nNatT(p.mapPosition), nNatT(p.townHallLevel), `${nPrct(hr[0])} n=${nNatr(hr[1])}`, `${nPrct(dr[0])} n=${nNatr(dr[1])}`, ((p.name))]),
                )),
                dTable,
                mapL(dSubC),
            ),
        ].flat());
};
