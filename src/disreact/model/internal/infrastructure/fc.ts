import * as Prototype from '#src/disreact/model/internal/infrastructure/prototype.ts';
import {INTERNAL_ERROR, isDEV} from '#src/disreact/model/internal/infrastructure/enum.ts';
import type * as Element from '#src/disreact/model/internal/core/element.ts';
import type * as E from 'effect/Effect';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId = Symbol.for('disreact/fc'),
             KindId = Symbol.for('disreact/fc/kind');

export const SYNC      = 1,
             ASYNC     = 2,
             EFFECT    = 3,
             ANONYMOUS = 'Anonymous';

type Props = Element.Props;
type Out = Element.Rendered;

export interface Base<P, O> extends Function {
  (props: P): O | Promise<O> | E.Effect<O, any, any>;
  displayName?: string;
}

interface Internal {
  [TypeId]    : string;
  [KindId]?   : unknown;
  displayName?: string;
  [Symbol.toStringTag](): string;
}

export interface Known<P extends Props = Props, O extends Out = Out> extends Function, Internal {
  (props: P): O | Promise<O> | E.Effect<O, any, any>;
}

export interface Sync<P, O> extends Function, Internal {
  [KindId]: typeof SYNC;
  (props: P): O;
}

export interface Async<P, O> extends Function, Internal {
  [KindId]: typeof ASYNC;
  (props: P): Promise<O>;
}

export interface Effect<P, O> extends Function, Internal {
  [KindId]: typeof EFFECT;
  (props: P): E.Effect<O>;
}

export type Any<P extends Props = Props, O extends Out = Out>
  = | Base<P, O>
    | Known<P, O>
    | Sync<P, O>
    | Async<P, O>
    | Effect<P, O>;

export type FC<P extends Props = Props, O extends Out = Out> = Base<P, O>;

const KnownProto = Prototype.declare<Known<Props, Out>>({
  [TypeId]: ANONYMOUS,
});

const SyncProto = Prototype.declare<Sync<Props, Out>>({
  [KindId]: SYNC,
});

const AsyncProto = Prototype.declare<Async<Props, Out>>({
  [KindId]: ASYNC,
});

const EffectProto = Prototype.declare<Effect<Props, Out>>({
  [KindId]: EFFECT,
});

export const register = (fn: FC): Known => {
  if (TypeId in fn) {
    return fn as Known;
  }
  const fc = Prototype.create(KnownProto, fn);

  if (fc.displayName) {
    fc[TypeId] = fc.displayName;
  }
  else if (fc.name) {
    fc[TypeId] = fc.name;
  }

  if (Prototype.isAsync(fc)) {
    return castAsync(fc);
  }
  return fc;
};

export const name = (maybe?: string | FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (typeof maybe === 'string') {
    return maybe;
  }
  if (isDEV && !(TypeId in maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)[TypeId] as string;
};

export const castSync = (fc: FC) => {
  if (isDEV && KindId in fc) {
    throw new Error(INTERNAL_ERROR);
  }
  return Prototype.create(SyncProto, fc as any);
};

export const castAsync = (fc: FC) => {
  if (isDEV && KindId in fc) {
    throw new Error(INTERNAL_ERROR);
  }
  return Prototype.create(AsyncProto, fc as any);
};

export const castEffect = (fc: FC) => {
  if (KindId in fc) {
    throw new Error(INTERNAL_ERROR);
  }
  return Prototype.create(EffectProto, fc as any);
};
