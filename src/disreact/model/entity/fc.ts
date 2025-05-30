import type * as El from '#src/disreact/model/entity/el.ts';
import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

export const FCTypeId = Symbol.for('disreact/fc'),
             FCNameId = Symbol.for('disreact/fc/name');

export const SYNC    = 0,
             PROMISE = 1,
             EFFECT  = 2;

const FCProto = Object.assign(Object.create(Function.prototype), {
  [Hash.symbol](this: any): number {
    return Hash.hash(this);
  },
  [Equal.symbol](this: any, that: any) {
    if (typeof that !== 'function') return false;
    return (
      this[FCTypeId] === that[FCTypeId]
      && this[FCNameId] === that[FCNameId]
    );
  },
});

const myFn1 = () => {};
const proto1 = Object.setPrototypeOf(myFn1, FCProto);

const myFn2 = () => {};
const proto2 = Object.setPrototypeOf(myFn2, FCProto);

export namespace FC {
  export type Output = El.Cs;
  export type OutEffect = E.Effect<El.Cs>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  export interface Any<P, O> extends Function {
    (props: P): O | Promise<O> | E.Effect<O, any, any>;
    [FCTypeId]? : number;
    [FCNameId]? : string;
    displayName?: string;
  }
  export interface Sync<P, O> extends Any<P, O> {
    (props: P): O;
    [FCTypeId]: typeof SYNC;
    [FCNameId]: string;
  }
  export interface Async<P, O> extends Any<P, O> {
    (props: P): O | Promise<O>;
    [FCTypeId]: typeof PROMISE;
    [FCNameId]: string;
  }
  export interface Effect<P, O> extends Any<P, O> {
    (props: P): E.Effect<O, any, any>;
    [FCTypeId]: typeof EFFECT;
    [FCNameId]: string;
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
  if (fc[FCTypeId] || fc[FCNameId]) return fc;
  if (fc.displayName) fc[FCNameId] = fc.displayName;
  else if (fc.name) fc[FCNameId] = fc.name;
  else fc[FCNameId] = '.';
  if (fc.constructor.name === 'AsyncFunction') fc[FCTypeId] = PROMISE;
  return fc;
};

export const isFC = (fc: unknown): fc is FC => typeof fc === 'function';

export const name = (input: FC.FC) => input[FCNameId]!;

export const render = (fc: FC.FC, props: any = {}) => {
  if (fc[FCTypeId] === SYNC) {
    return E.sync(() => fc(props)) as FC.OutEffect;
  }
  if (fc[FCTypeId] === PROMISE) {
    return E.promise(async () => await fc(props)) as FC.OutEffect;
  }
  if (fc[FCTypeId] === EFFECT) {
    return fc(props) as FC.OutEffect;
  }
  return E.suspend(() => {
    const out = fc(props);
    if (P.isPromise(out)) {
      fc[FCTypeId] = PROMISE;
      return E.promise(async () => await out) as FC.OutEffect;
    }
    if (E.isEffect(out)) {
      fc[FCTypeId] = EFFECT;
      return out as FC.OutEffect;
    }
    fc[FCTypeId] = SYNC;
    return E.succeed(out) as FC.OutEffect;
  });
};
