import type {JSX} from '#src/disreact/jsx-runtime.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {INTERNAL_ERROR, isDEV} from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as Element from '#src/disreact/model/internal/core/exp/element.ts';
import type * as E from 'effect/Effect';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId    = Symbol.for('disreact/fc'),
             KindId    = Symbol.for('disreact/fc/kind'),
             SYNC      = 1,
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
  [KindId]?   : number;
  displayName?: string;
}

export interface Known<A, B> extends Function, Internal {
  (props: A): B | Promise<B> | E.Effect<B, any, any>;
}

export interface Sync<A, B> extends Function, Internal {
  [KindId]: typeof SYNC;
  (props: A): B;
}

export interface Async<A, B> extends Function, Internal {
  [KindId]: typeof ASYNC;
  (props: A): Promise<B>;
}

export interface Effect<A, B> extends Function, Internal {
  [KindId]: typeof EFFECT;
  (props: A): E.Effect<B>;
}

type thing = JSX.Element;

export interface FC<P = any, O = any, E = any, R = any> extends Function {
  (props: P): O | Promise<O> | E.Effect<O, E, R>;
  displayName?: string;
}

export const isFC = (fc: unknown): fc is FC => typeof fc === 'function';

export const isKnown = (fc: FC): fc is Known => TypeId in fc;

export const Prototype = proto.declare<Known<Props, Out>>({
  [TypeId]: ANONYMOUS,
});

export const SyncProto = proto.declare<Sync<Props, Out>>({
  [KindId]: SYNC,
});

export const AsyncProto = proto.declare<Async<Props, Out>>({
  [KindId]: ASYNC,
});

export const EffectProto = proto.declare<Effect<Props, Out>>({
  [KindId]: EFFECT,
});

type Proto = | typeof SyncProto
             | typeof AsyncProto
             | typeof EffectProto;

export const isCasted = (fc: FC) => KindId in fc;

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
  if (proto.isAsync(fc)) {
    cast(fc, AsyncProto);
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

export const kind = (fc: FC): number | undefined => (fc as Known)[KindId];
