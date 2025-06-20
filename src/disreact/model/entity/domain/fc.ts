import * as proto from '#src/disreact/model/infrastructure/proto.ts';
import {INTERNAL_ERROR, isDEV} from '#src/disreact/model/infrastructure/proto.ts';
import type * as Element from '#src/disreact/model/entity/core/exp/element.ts';
import * as type from '#src/disreact/model/infrastructure/type.ts';
import type * as E from 'effect/Effect';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId    = Symbol.for('disreact/fc'),
             CastId    = Symbol.for('disreact/fc/kind');

export const SYNC      = 1,
             ASYNC     = 2,
             EFFECT    = 3,
             ANONYMOUS = 'Anonymous';

type Props = Element.Props;
type Out = Element.Rendered;

interface Base<P, O, E = any, R = any> extends Function {
  (props: P): O | Promise<O> | E.Effect<O, E, R>;
  displayName?: string;
}

interface Internal {
  [TypeId]    : string;
  [CastId]?   : number;
  displayName?: string;
}

export interface Known<A = any, B = any> extends Function, Internal {
  (props: A): B | Promise<B> | E.Effect<B, any, any>;
}

export interface Sync<A = any, B = any> extends Function, Internal {
  [CastId]: typeof SYNC;
  (props: A): B;
}

export interface Async<A = any, B = any> extends Function, Internal {
  [CastId]: typeof ASYNC;
  (props: A): Promise<B>;
}

export interface Effect<A = any, B = any> extends Function, Internal {
  [CastId]: typeof EFFECT;
  (props: A): E.Effect<B>;
}

export interface FC<P = any, O = any, E = any, R = any> extends Function {
  (props: P): O | Promise<O> | E.Effect<O, E, R>;
  displayName?: string;
}

export const isFC = (fc: unknown): fc is FC => typeof fc === 'function';

export const isKnown = (fc: FC): fc is Known => TypeId in fc;

export const Prototype = proto.declare<Known>({
  [TypeId]: ANONYMOUS,
});

export const SyncPrototype = proto.declare<Sync>({
  [CastId]: SYNC,
});

export const AsyncPrototype = proto.declare<Async>({
  [CastId]: ASYNC,
});

export const EffectPrototype = proto.declare<Effect>({
  [CastId]: EFFECT,
});

type Proto = | typeof SyncPrototype
             | typeof AsyncPrototype
             | typeof EffectPrototype;

export const isCasted = (fc: FC) => CastId in fc;

export const cast = (fc: FC, p: Proto) => {
  if (isDEV && isKnown(fc)) {
    throw new Error(INTERNAL_ERROR);
  }
  if (isDEV && isCasted(fc)) {
    throw new Error(INTERNAL_ERROR);
  }
  proto.impure(p, fc as any);
};

export const register = (fn: FC): Known => {
  if (isKnown(fn)) {
    return fn;
  }
  const fc = proto.impure(Prototype, fn);
  
  if (fc.displayName) {
    fc[TypeId] = fc.displayName;
  }
  else if (fc.name) {
    fc[TypeId] = fc.name;
  }
  else {
    fc[TypeId] = ANONYMOUS;
  }
  if (type.isAsync(fc)) {
    cast(fc, AsyncPrototype);
    return fc;
  }
  return fc;
};

export const isAnonymous = (fc: FC) => name(fc) === ANONYMOUS;

export const overrideName = (fc: FC, name: string) => {
  (fc as any)[TypeId] = name;
};

export const name = (maybe?: string | FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (!isFC(maybe)) {
    return maybe;
  }
  if (isDEV && !isKnown(maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)[TypeId] as string;
};

export const kind = (fc: FC): number | undefined => (fc as Known)[CastId];
