import {S} from '#src/internal/pure/effect.ts';
import type {Brand} from 'effect';



export const StartsWithId = <T extends string>(start: string, brand: T) => S.transform(
  S.String.pipe(S.startsWith(start), S.brand(brand)),
  S.String,
  {
    strict: true,
    decode: (s) => s.replace(start, '') as string & Brand.Brand<typeof brand>,
    encode: (s) => start.concat(s) as string & Brand.Brand<typeof brand>,
  },
);
