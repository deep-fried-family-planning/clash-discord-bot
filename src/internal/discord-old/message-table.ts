import {pipe} from '#src/internal/pure/effect.ts';
import {concatL, mapL, reduceL} from '#src/internal/pure/pure-list.ts';
import {range} from 'effect/Array';

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
    mapL(mapL((t, idx) => {
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
