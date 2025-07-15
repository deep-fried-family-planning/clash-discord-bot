/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {ASYNC, EFFECT, type FCExecution, SYNC} from '#disreact/core/immutable/constants.ts';
import * as internal from '#disreact/core/internal/fn.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.ts';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as P from 'effect/Predicate';
import type * as Pipeable from 'effect/Pipeable';

export type Out = Jsx.Children;

interface Base extends Inspectable.Inspectable {
  _id?        : string;
  _tag?       : FCExecution;
  displayName?: string;
}

export interface Known<A = any> extends Function, Base, Pipeable.Pipeable {
  state    : boolean;
  props    : boolean;
  endpoint?: string;
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

export const toRenderable = (self: Known) => {
  switch (self._tag) {
    case SYNC: {
      return (props: any) => E.sync(() => self(props));
    }
    case ASYNC: {
      return (props: any) => E.promise(() => self(props) as Promise<any>);
    }
    case EFFECT: {
      return (props: any) => E.suspend(() => self(props) as E.Effect<any>);
    }
  }
  return (props: any) => E.suspend(() => {
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

export const renderSelf = (self: Known): E.Effect<Jsx.Children> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(self as any);
    }
    case ASYNC: {
      return E.promise(self as any);
    }
    case EFFECT: {
      return E.suspend(self as any) as E.Effect<Jsx.Children>;
    }
  }
  return E.sync(self).pipe(E.flatMap((out) => {
    if (P.isPromise(out)) {
      self._tag = ASYNC;
      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      self._tag = EFFECT;
      return out as E.Effect<Jsx.Children>;
    }
    self._tag = SYNC;
    return E.succeed(out as Jsx.Children);
  }));
};

export const renderPropsDF = (self: Known, props: any): E.Effect<Jsx.Children> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(() => self(props) as Jsx.Children);
    }
    case ASYNC: {
      return E.promise(() => self(props) as Promise<Jsx.Children>);
    }
    case EFFECT: {
      return E.suspend(() => self(props) as E.Effect<Jsx.Children>);
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
      return out as E.Effect<Jsx.Children>;
    }
    self._tag = SYNC;
    return E.succeed(out);
  });
};

export const renderProps = dual<
  (props: any) => (self: Known) => E.Effect<Jsx.Children>,
  (self: Known, props: any) => E.Effect<Jsx.Children>
>(2, (self, props) => renderPropsDF(self, props));

export const renderUsingDF = (self: Known, props: any, use: any): E.Effect<Jsx.Children> => {
  switch (self._tag) {
    case SYNC: {
      return E.sync(() => self(props, use) as Jsx.Children);
    }
    case ASYNC: {
      return E.promise(() => self(props, use) as Promise<Jsx.Children>);
    }
    case EFFECT: {
      return E.suspend(() => self(props, use) as E.Effect<Jsx.Children>);
    }
  }
  return E.suspend(() => {
    const out = self(props, use);

    if (P.isPromise(out)) {
      self._tag = ASYNC;
      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      self._tag = EFFECT;
      return out as E.Effect<Jsx.Children>;
    }
    self._tag = SYNC;
    return E.succeed(out as Jsx.Children);
  });
};

export const renderUsing = dual<
  (props: any, use: any) => (self: Known) => E.Effect<Jsx.Children>,
  (self: Known, props: any, use: any) => E.Effect<Jsx.Children>
>(3, (self, props, use) => renderUsingDF(self, props, use));
