import {INTERNAL_ERROR, IS_DEV} from '#src/disreact/core/primitives/constants.ts';
import type * as FC from '#src/disreact/model/runtime/fc.ts';
import type * as Jsx from '#src/disreact/model/runtime/jsx.tsx';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import * as type from '#src/disreact/core/primitives/type.ts';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';

export const TypeId = Symbol.for('disreact/event');

export interface Event extends Pipeable.Pipeable {
  [TypeId]?: typeof TypeId;
  id       : string;
  property : string;
  target   : any;
  node     : any;

  next(node: Jsx.Jsx): void;
  next<P>(fc: FC.FC<P>, props: P): void;
  close(): void;
};

export const isEvent = (u: unknown): u is Event => typeof u === 'object' && u !== null && TypeId in u;

const Prototype = proto.type<Event>({
  [TypeId]: TypeId,
  id      : '',
  property: '',
  target  : undefined,
  node    : undefined,
  next    : () => {},
  close   : () => {},
  ...Pipeable.Prototype,
});

export const make = () => {};

export interface Handler<E = any, R = any> extends type.Fn {
  [TypeId]?: typeof TypeId;
  [Hash.symbol]?(): number;
  [Equal.symbol]?(that: Handler): boolean;

  (event: Event): | void
                  | Promise<void>
                  | E.Effect<E, R>;
}

export const isHandler = (u: unknown): u is Handler => typeof u === 'function' && TypeId in u;

const HandlerPrototype = proto.type<Handler>({
  [TypeId]: TypeId,
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: Handler) {
    if (TypeId in that) {
      return true;
    }
    return false;
  },
});

export const handler = (handler: Handler): Handler =>
  proto.impure(HandlerPrototype, handler);

export const invoke = (event: Event, handler: Handler): E.Effect<void> => {
  if (IS_DEV && (!isHandler(handler) || !isEvent(event))) {
    throw new Error(INTERNAL_ERROR);
  }
  if (type.isAsync(handler)) {
    return E.promise(() => handler(event));
  }
  return E.suspend(() => {
    const out = handler(event);

    if (P.isPromise(out)) {
      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      return out as E.Effect<void>;
    }
    return E.void;
  });
};
