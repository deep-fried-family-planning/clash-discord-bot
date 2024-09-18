import {concatL, mapIdxL, mapL, reduceL} from '#src/data/pure-list.ts';
import {pipe} from 'fp-ts/function';
import {range} from 'fp-ts/NonEmptyArray';

export const dTable = (tss: string[][]) => {
    const longest = pipe(
        range(0, tss[0].length - 1),
        mapL((idx) => pipe(tss, mapL((ts) => ts[idx] ?? []))),
        mapL(reduceL(0, (n, t) => {
            const len = Array.from(t).length;
            return len > n
                ? len
                : n;
        })),
    );

    return pipe(
        tss,
        mapL(mapIdxL((idx, t) => {
            if (idx === longest.length - 1) {
                return t;
            }
            const lenReq = longest[idx];
            let len = Array.from(t).length;
            let str = '' + t;
            while (len < lenReq) {
                str += ' ';
                len++;
            }
            return str;
        })),
        mapL(reduceL('', (ts0, t) => ts0 + t + ' ')),
    );
};

export const dTableFull = (header: string[][], rows: string[][]) => pipe(
    header,
    concatL(rows),
    dTable,
);
