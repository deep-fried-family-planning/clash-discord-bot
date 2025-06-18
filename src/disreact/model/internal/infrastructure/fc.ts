import type * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Prototype from '#src/disreact/model/internal/infrastructure/prototype.ts';
import {INTERNAL_ERROR, isDEV} from '#src/disreact/model/internal/infrastructure/prototype.ts';
import type * as E from 'effect/Effect';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId = Symbol.for('disreact/fc'),
             KindId = Symbol.for('disreact/fc/kind'),
             SYNC   = 1,
             ASYNC  = 2,
             EFFECT = 3;

export const ANONYMOUS = 'Anonymous';

type Props = Element.Props;
type Out = Element.Rendered;

export interface Base<P, O> extends Function {
  (props: P): O | Promise<O> | E.Effect<O, any, any>;
  displayName?: string;
}

interface Internal {
  [TypeId]    : string;
  [KindId]?   : number;
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

export const SyncProto = Prototype.declare<Sync<Props, Out>>({
  [KindId]: SYNC,
});

export const AsyncProto = Prototype.declare<Async<Props, Out>>({
  [KindId]: ASYNC,
});

export const EffectProto = Prototype.declare<Effect<Props, Out>>({
  [KindId]: EFFECT,
});

type Proto =
  | typeof SyncProto
  | typeof AsyncProto
  | typeof EffectProto;

export const isFunction = (fc: unknown): fc is FC => typeof fc === 'function';

export const isRegistered = (fc: FC): fc is Known => TypeId in fc;

export const register = (fn: FC): Known => {
  if (isRegistered(fn)) {
    return fn;
  }
  const fc = Prototype.impure(KnownProto, fn);

  if (fc.displayName) {
    fc[TypeId] = fc.displayName;
  }
  else if (fc.name) {
    fc[TypeId] = fc.name;
  }

  if (Prototype.isAsync(fc)) {
    return cast(fc, AsyncProto);
  }
  return fc;
};

export const isCasted = (fc: FC) => KindId in fc;

export const cast = <A extends Proto>(fc: FC, proto: A): A => {
  if (isDEV && isRegistered(fc)) {
    throw new Error(INTERNAL_ERROR);
  }
  if (isDEV && isCasted(fc)) {
    throw new Error(INTERNAL_ERROR);
  }
  return Prototype.impure(proto, fc as any);
};

export const isAnonymous = (fc: FC) => name(fc) === ANONYMOUS;

export const overrideName = (fc: FC, name: string) => {
  (fc as any)[TypeId] = name;
};

export const name = (maybe?: string | FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (!isFunction(maybe)) {
    return maybe;
  }
  if (isDEV && !isRegistered(maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)[TypeId] as string;
};

export const kind = (fc: FC): number | undefined => (fc as Known)[KindId];
