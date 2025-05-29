/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as El from '#src/disreact/mode/entity/el.ts';
import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';

export const TypeId = Symbol.for('disreact/fc/type');
export const NameId = Symbol.for('disreact/fc/name');
export const SYNC = 0;
export const PROMISE = 1;
export const EFFECT = 2;

export namespace FC {
  export type Output = El.Cs;
  export type OutEffect = E.Effect<El.Cs>;

  export interface Any<P, O> extends Function {
    (props: P): O | Promise<O> | E.Effect<O, any, any>;
    [TypeId]?   : number;
    [NameId]?   : string;
    displayName?: string;
  }
  export interface Sync<P, O> extends Any<P, O> {
    (props: P): O;
    [TypeId]: typeof SYNC;
    [NameId]: string;
  }
  export interface Async<P, O> extends Any<P, O> {
    (props: P): O | Promise<O>;
    [TypeId]: typeof PROMISE;
    [NameId]: string;
  }
  export interface Effect<P, O> extends Any<P, O> {
    (props: P): E.Effect<O, any, any>;
    [TypeId]: typeof EFFECT;
    [NameId]: string;
  }
  export type FC<P = any, O = FC.Output> =
    | FC.Any<P, O>
    | FC.Sync<P, O>
    | FC.Async<P, O>
    | FC.Effect<P, O>;
}
export type Any<P = any, O = FC.Output> = FC.Any<P, O>;
export type Sync<P = any, O = FC.Output> = FC.Sync<P, O>;
export type Async<P = any, O = FC.Output> = FC.Async<P, O>;
export type Effect<P = any, O = FC.Output> = FC.Effect<P, O>;
export type FC<P = any, O = FC.Output> = FC.FC<P, O>;

export const make = (fc: FC.Any<any, any>) => {
  if (fc[TypeId] || fc[NameId]) return fc;
  if (fc.displayName) fc[NameId] = fc.displayName;
  else if (fc.name) fc[NameId] = fc.name;
  else fc[NameId] = '.';
  if (fc.constructor.name === 'AsyncFunction') fc[TypeId] = PROMISE;
  return fc;
};

export const isFC = (fc: unknown): fc is FC => typeof fc === 'function';

export const name = (input: FC.FC) => input[NameId]!;

export const render = (fc: FC.FC, props: any = {}) => {
  if (fc[TypeId] === SYNC) {
    return E.sync(() => fc(props)) as FC.OutEffect;
  }
  if (fc[TypeId] === PROMISE) {
    return E.promise(async () => await fc(props)) as FC.OutEffect;
  }
  if (fc[TypeId] === EFFECT) {
    return fc(props) as FC.OutEffect;
  }
  return E.suspend(() => {
    const out = fc(props);
    if (P.isPromise(out)) {
      fc[TypeId] = PROMISE;
      return E.promise(async () => await out) as FC.OutEffect;
    }
    if (E.isEffect(out)) {
      fc[TypeId] = EFFECT;
      return out as FC.OutEffect;
    }
    fc[TypeId] = SYNC;
    return E.succeed(out) as FC.OutEffect;
  });
};
