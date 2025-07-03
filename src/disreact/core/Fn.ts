/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as proto from '#disreact/core/behaviors/proto.ts';
import {ASYNC, EFFECT, type FCExecution, SYNC} from '#disreact/core/immutable/constants.ts';
import * as internal from '#disreact/core/internal/fc.ts';
import type * as Node from '#disreact/core/Element.ts';
import * as E from 'effect/Effect';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import * as P from 'effect/Predicate';

export interface Endpoint {
  id       : string;
  component: any;
}

export type Out = JSX.Element;

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

export const endpoint = internal.endpoint;

export const isStatelessFC = (u: Known) => !u.state;

export const markStateless = (self: Known): Known => {
  self.state = false;
  return self;
};

export const render = (self: Known, props: any): E.Effect<any> => {
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

export const renderStateless = (self: Known): E.Effect<any> => {
  switch (self._tag) {
    case SYNC: {
      return E.succeed(self());
    }
    case ASYNC: {
      return E.promise(self as any);
    }
    case EFFECT: {
      return E.suspend(self as any) as E.Effect<any>;
    }
  }
  const out = self();

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
};

export type VoidEffect<E = never, R = never> = E.Effect<void, E, R>;

export interface EffectFn<E = never, R = never> extends Function {
  (): | void
      | Promise<void>
      | E.Effect<void, E, R>;
}

export type Fx<E = never, R = never> = | EffectFn<E, R>
                                       | VoidEffect<E, R>;

export const flush = (self: Fx) => {
  if (proto.isEffect(self)) {
    return self;
  }
  if (proto.isAsync(self)) {
    return E.promise(self);
  }
  return E.suspend(() => {
    const out = self();

    if (P.isPromise(out)) {
      return E.promise(() => out);
    }
    if (proto.isEffect(out)) {
      return out;
    }
    return E.void;
  });
};

export interface EventInput<D = any, T = any> {
  endpoint: string;
  id      : string;
  lookup  : string;
  handler : string;
  target  : T;
  data    : D;
}

export interface Event<D = any, T = any> {
  target: T;
  data  : D;

  close(): void;
  open(node: Node.Element): void;
  openFC<P>(component: FC<P>, props: P): void;
}

export interface EventInternal<D = any, T = any> extends EventInput<D, T>, Event<D, T>, Inspectable.Inspectable {
  compare: {
    endpoint: string | null;
    props   : any;
  };
}

export interface Handler<D = any, T = any, E = never, R = never> extends Function {
  (event: Event<D, T>): | void
                        | Promise<void>
                        | E.Effect<void, E, R>;
}

export interface EventHandler<D = any, T = any, E = never, R = never> extends Handler<D, T, E, R>, Inspectable.Inspectable, Hash.Hash, Equal.Equal {
  [internal.HandlerId]: typeof internal.HandlerId;
}

export const event = internal.event;

export const isCloseEvent = (event: EventInternal) => event.compare.endpoint === null;

export const isOpenEvent = (event: EventInternal) => event.compare.endpoint !== event.endpoint;

export const handler = internal.handler;

export const invoke = (self: Handler, event: EventInternal) => {
  if (proto.isAsync(self)) {
    return E.promise(() => self(event));
  }
  return E.suspend(() => {
    const out = self(event);

    if (P.isPromise(out)) {
      return E.promise(() => out);
    }
    if (proto.isEffect<void>(out)) {
      return out;
    }
    return E.void;
  });
};
