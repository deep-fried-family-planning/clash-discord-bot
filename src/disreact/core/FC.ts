/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as t from '#src/disreact/core/behaviors/type.ts';
import {ANONYMOUS, ASYNC, EFFECT, type FCExecution, INTERNAL_ERROR, SYNC} from '#src/disreact/core/primitives/constants.ts';
import type * as Jsx from '#disreact/model/runtime/jsx.tsx';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import * as P from 'effect/Predicate';
import type * as Inspectable from 'effect/Inspectable';
import * as fc from '#src/disreact/core/primitives/fc.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';

export type Out = any;

interface Base extends Inspectable.Inspectable {
  _id?        : string;
  _tag?       : FCExecution;
  displayName?: string;
}

export interface Known<A = any> extends Function, Base {
  stateless: boolean;
  (props?: A): Out | Promise<Out> | E.Effect<Out, any, any>;
}

export interface Sync<A = any> extends Function, Base {
  _tag: typeof SYNC;
  (props?: A): Out;
}

export interface Async<A = any> extends Function, Base {
  _tag: typeof ASYNC;
  (props?: A): Promise<Out>;
}

export interface Effect<A = any> extends Function, Base {
  _tag: typeof EFFECT;
  (props?: A): E.Effect<Out>;
}

export interface FC<P = any, E = any, R = any> extends Function {
  (props?: P): Out | Promise<Out> | E.Effect<Out, E, R>;
  _id?        : string;
  displayName?: string;
}

export const isFC = (u: unknown): u is FC => fc.isFC(u);

export const isCasted = (u: FC): u is Known => fc.isCasted(u);

export const isAnonymous = (u: FC): u is Known => fc.isAnonymous(u);

export const isStateless = (u: Known) => u.stateless;

export const markStateless = (self: Known): Known => {
  self.stateless = true;
  return self;
};

export const renderFirst = (self: Known, props: any): E.Effect<any> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(() => self(props));
    }
    case ASYNC: {
      return E.promise(() => self(props) as Promise<any>);
    }
    case EFFECT: {
      return self(props) as E.Effect<any>;
    }
  }
  return E.suspend(() => {
    const out = self(props);

    if (P.isPromise(out)) {
      self._tag = ASYNC;
      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      self._tag = EFFECT;
      return out as E.Effect<any>;
    }
    self._tag = SYNC;
    return E.succeed(out);
  });
};

export const render = dual<
  (props: any) => (self: Known) => E.Effect<any>,
  typeof renderFirst
>(2, renderFirst);
