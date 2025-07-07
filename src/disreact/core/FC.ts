/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {ASYNC, EFFECT, type FCExecution, SYNC} from '#disreact/core/immutable/constants.ts';
import * as internal from '#disreact/core/internal/fn.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as P from 'effect/Predicate';

export type Out = JSX.Element<any, any>;

interface Base extends Inspectable.Inspectable {
  _id?        : string;
  _tag?       : FCExecution;
  displayName?: string;
}

export interface Known<A = any> extends Function, Base {
  state: boolean;
  props: boolean;
  (props?: A, use?: any): Out | Promise<Out> | E.Effect<Out, any, any>;
}

export interface Sync<A = any> extends Function, Base {
  _tag: typeof SYNC;
  (props?: A, use?: any): Out;
}

export interface Async<A = any> extends Function, Base {
  _tag: typeof ASYNC;
  (props?: A, use?: any): Promise<Out>;
}

export interface Effect<A = any> extends Function, Base {
  _tag: typeof EFFECT;
  (props?: A, use?: any): E.Effect<Out>;
}

export interface FC<P = any, E = any, R = any> extends Function {
  (props?: P, use?: any): Out | Promise<Out> | E.Effect<Out, E, R>;
  _id?        : string;
  displayName?: string;
  state?      : boolean;
  props?      : boolean;
}

export const isFC = internal.isFC;

export const register = internal.register;

export const endpoint = internal.endpoint;

export const isKnown = internal.isKnown;

export const isCasted = internal.isCasted;

export const isStateless = (u: Known) => !u.state;

export const markStateless = (self: Known): Known => {
  self.state = false;
  return self;
};

export const name = internal.name;

export const renderProps = (self: Known, props: any): E.Effect<any> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(() => self(props));
    }
    case ASYNC: {
      return E.promise(() => self(props) as Promise<any>);
    }
    case EFFECT: {
      return E.suspend(() => self(props) as E.Effect<any>);
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

export const renderSelf = (self: Known): E.Effect<any> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(self);
    }
    case ASYNC: {
      return E.promise(self as any);
    }
    case EFFECT: {
      return E.suspend(self as any) as E.Effect<any>;
    }
  }
  return E.sync(self).pipe(E.flatMap((out) => {
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
  }));
};
