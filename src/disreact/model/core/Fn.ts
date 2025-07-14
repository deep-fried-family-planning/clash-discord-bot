import * as Internal from '#disreact/model/core/internal.ts';
import type * as Jsx from '#disreact/model/Jsx.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as P from 'effect/Predicate';

export type Fn = never;

export type FCKind = | 'Sync'
                     | 'Async'
                     | 'Effect'
                     | undefined;

export interface JsxFC<K extends FCKind = FCKind> extends Inspectable.Inspectable {
  _tag        : K;
  _id         : string;
  _state      : boolean;
  _props      : boolean;
  entrypoint? : string | undefined;
  displayName?: string;

  <P = any, E = never, R = never>(props?: P):
    K extends 'Sync' ? Jsx.Children :
    K extends 'Async' ? Promise<Jsx.Children> :
    K extends 'Effect' ? E.Effect<Jsx.Children, E, R> :
    | Jsx.Children
    | Promise<Jsx.Children>
    | E.Effect<Jsx.Children, E, R>;
}

export const normalizeFC = (fc: JsxFC, props?: any): E.Effect<Jsx.Children> => {
  switch (fc._tag) {
    case 'Sync': {
      return E.sync(() => fc(props) as Jsx.Children);
    }
    case 'Async': {
      return E.promise(() => fc(props) as Promise<Jsx.Children>);
    }
    case 'Effect': {
      return E.suspend(() => fc(props) as E.Effect<Jsx.Children>);
    }
  }
  if (fc.constructor === Internal.asyncFnConstructor) {
    fc._tag = 'Async';
    return E.promise(() => fc(props) as Promise<Jsx.Children>);
  }
  return E.suspend(() => {
    const output = fc(props);

    if (P.isPromise(output)) {
      fc._tag = 'Async';
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      fc._tag = 'Effect';
      return output as E.Effect<Jsx.Children>;
    }
    fc._tag = 'Sync';
    return E.succeed(output);
  });
};

export type Effector<E = never, R = never> =
  | EffectFn
  | E.Effect<void, E, R>;

export interface EffectFn {
  <E = never, R = never>():
    | void
    | Promise<void>
    | E.Effect<void, E, R>;
}

export const normalizeEffector = (effector: Effector): E.Effect<void> => {
  if (typeof effector === 'object') {
    return effector;
  }
  if (effector.constructor === Internal.asyncFnConstructor) {
    return E.promise(() => effector() as Promise<void>);
  }
  return E.suspend(() => {
    const output = effector();

    if (P.isPromise(output)) {
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      return output as E.Effect<void>;
    }
    return E.void;
  });
};

export interface EventFn {
  <A = any, E = never, R = never>(event: A):
    | void
    | Promise<void>
    | E.Effect<void, E, R>;
}

export const normalizeEventFn = (fn: EventFn, event: any): E.Effect<void> => {
  if (fn.constructor === Internal.asyncFnConstructor) {
    return E.promise(() => fn(event) as Promise<void>);
  }
  return E.suspend(() => {
    const output = fn(event);

    if (P.isPromise(output)) {
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      return output as E.Effect<void>;
    }
    return E.void;
  });
};
