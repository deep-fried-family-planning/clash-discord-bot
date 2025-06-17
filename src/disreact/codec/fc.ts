import * as Const from '#src/disreact/model/internal/core/enum.ts';
import * as Proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';

export const TypeId  = Symbol('disreact/fc'),
             SYNC    = 1,
             PROMISE = 2,
             EFFECT  = 3,
             KindId  = Symbol('disreact/fc/kind'),
             NameId  = Symbol('disreact/fc/name');

export namespace FC {
  type Thing<A, B> = (props: A) => B;


  export interface Any<P, O> extends Thing<P, O> {
    (props: P): O | Promise<O> | E.Effect<O, any, any>;
    [TypeId]?   : FC;
    [KindId]?   : number;
    [NameId]?   : string;
    displayName?: string;
  }
  export interface Sync<P, O> extends Any<P, O> {
    (props: P): O;
    [KindId]: typeof SYNC;
    [NameId]: string;
  }
  export interface Async<P, O> extends Any<P, O> {
    (props: P): O | Promise<O>;
    [KindId]: typeof PROMISE;
    [NameId]: string;
  }
  export interface Effect<P, O> extends Any<P, O> {
    (props: P): E.Effect<O, any, any>;
    [KindId]: typeof EFFECT;
    [NameId]: string;
  }
  export type FC<P = any, O = any> =
    | FC.Any<P, O>
    | FC.Sync<P, O>
    | FC.Async<P, O>
    | FC.Effect<P, O>;
}
export type Any<P = any, O = any> = FC.Any<P, O>;
export type Sync<P = any, O = any> = FC.Sync<P, O>;
export type Async<P = any, O = any> = FC.Async<P, O>;
export type Effect<P = any, O = any> = FC.Effect<P, O>;
export type FC<P = any, O = any> = FC.FC<P, O>;

export const isFC = (fc: unknown): fc is FC => typeof fc === 'function';

export const isDefined = (fc: unknown): fc is FC =>
  typeof fc === 'function'
  && TypeId in fc
  && fc[TypeId] === TypeId;

const FcProto = {
  [Hash.symbol](this: FC) {
    return Hash.string(TypeId.toString());
  },
  [Equal.symbol](this: FC, that: FC) {
    return this[TypeId] === that[TypeId];
  },
};

export const type = (fc: FC) => fc[TypeId]!;
const kind = (fc: FC) => fc[KindId];

export const make = (f: Any): Any => {
  if (f[TypeId]) {
    return f;
  }
  if (!f[NameId]) {
    if (f.displayName) {
      f[NameId] = f.displayName;
    }
    else if (f.name) {
      f[NameId] = f.name;
    }
    else {
      f[NameId] = '.';
    }
    if (f.constructor.name === Const.ASYNC_FUNCTION) {
      f[KindId] = Const.PROMISE;
    }
  }
  (f[TypeId] as any) = TypeId;
  return f;
};

export const id = (input: FC.FC) => input[NameId];

export const name = (fc: FC.FC, name: string) => {
  const current = id(fc);
  if (current === name) {
    return;
  }
  if (current === '.') {
    fc[NameId] = name;
  }
  else {
    throw new Error(`Renaming ${current} to ${name}`);
  }
};

export const render = (f: FC, p: any): E.Effect<any> => {
  switch (f[KindId]) {
    case Const.SYNC: {
      return E.sync(() => f(p));
    }
    case Const.PROMISE: {
      return E.promise(() => f(p));
    }
    case Const.EFFECT: {
      return f(p);
    }
    default: {
      return E.suspend(() => {
        const out = f(p);
        if (Predicate.isPromise(out)) {
          f[KindId] = Const.PROMISE;
          return E.promise(() => out);
        }
        if (E.isEffect(out)) {
          f[KindId] = Const.EFFECT;
          return out as E.Effect<any>;
        }
        f[KindId] = Const.SYNC;
        return E.succeed(out);
      });
    }
  }
};
