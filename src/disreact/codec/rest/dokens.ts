import {S} from '#src/internal/pure/effect.ts';
import { Struct } from 'effect/Schema';
import * as Doken from './doken.ts';



export const Type = Struct({
  fresh: Doken.Type,
  defer: S.optional(Doken.Type),
});

export type Type = S.Schema.Type<typeof Type>;



export const make = (rest: any): Type => ({
  fresh: Doken.makeFromRest(rest),
});
