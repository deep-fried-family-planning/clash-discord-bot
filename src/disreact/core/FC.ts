/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as t from '#src/disreact/core/behaviors/type.ts';
import {ANONYMOUS, ASYNC, EFFECT, type FCExecution, INTERNAL_ERROR, SYNC} from '#src/disreact/core/primitives/constants.ts';
import type * as Jsx from '#disreact/model/runtime/jsx.tsx';
import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';

interface Base  {
  _id?        : string;
  _tag?       : FCExecution;
  displayName?: string;
}

export interface Known<A = any, B = Jsx.Children> extends Function, Base {
  (props?: A): B | Promise<B> | E.Effect<B, any, any>;
}

export interface Sync<A = any, B = Jsx.Children> extends Function, Base {
  _tag: typeof SYNC;
  (props?: A): B;
}

export interface Async<A = any, B = Jsx.Children> extends Function, Base {
  _tag: typeof ASYNC;
  (props?: A): Promise<B>;
}

export interface Effect<A = any, B = Jsx.Children> extends Function, Base {
  _tag: typeof EFFECT;
  (props?: A): E.Effect<B>;
}

export interface FC<P = any, O = Jsx.Children, E = any, R = any> extends Function {
  (props?: P): O | Promise<O> | E.Effect<O, E, R>;
  displayName?: string;
}

export const render = (self: Known, props: any): E.Effect<any> => {
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
