import {EmbedParams, type Params} from '#src/disreact/codec/rest/index.ts';
import {type DokenError, DokenMemory} from '#src/disreact/interface/DokenMemory.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Schema} from 'effect/Schema';
import {mutable, optional, Struct} from 'effect/Schema';
import {Doken} from '.';



export const T = mutable(Struct({
  fresh: Doken.T,
  defer: optional(Doken.T),
}));

export type T = Schema.Type<typeof T>;

export const make = (request: any): T => ({
  fresh: Doken.makeFreshDoken(request),
});

export const add = (self: T, params: Params.T) => {
  if (EmbedParams.is(params)) {
    self.defer = Doken.makeDokenFromEmbedParams(params);
    return self;
  }

  self.defer = Doken.makeDokenFromDialogParams(params);
  return self;
};

export const getDoken = (self: T): Doken.T => self.defer ?? self.fresh;

export const resolvePartial = (self: T): E.Effect<Doken.T | undefined | null, DokenError, DokenMemory> => {
  if (self.defer && Doken.isPartialDoken(self.defer)) {
    return DokenMemory.load(self.defer.id);
  }
  return E.succeed(self.defer);
};
