import type {Schema} from 'effect/Schema';
import {mutable, optional, Struct} from 'effect/Schema';
import * as Doken from './doken.ts';



export const Dokens = mutable(Struct({
  fresh: Doken.Doken,
  defer: optional(Doken.Doken),
}));

export type Dokens = Schema.Type<typeof Dokens>;

export const makeDokens = (request: any): Dokens => ({
  fresh: Doken.makeFreshDoken(request),
});
