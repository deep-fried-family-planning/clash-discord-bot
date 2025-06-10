import * as Proto from '#src/disreact/model/util/proto.ts';
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  export interface Any<P, O> extends Function {
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
    if (f.constructor.name === 'AsyncFunction') {
      f[KindId] = PROMISE;
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
    case SYNC: {
      return E.sync(() => f(p));
    }
    case PROMISE: {
      return E.promise(() => f(p));
    }
    case EFFECT: {
      return f(p);
    }
    default: {
      return E.suspend(() => {
        const out = f(p);
        if (Predicate.isPromise(out)) {
          f[KindId] = PROMISE;
          return E.promise(() => out);
        }
        if (E.isEffect(out)) {
          f[KindId] = EFFECT;
          return out as E.Effect<any>;
        }
        f[KindId] = SYNC;
        return E.succeed(out);
      });
    }
  }
};
