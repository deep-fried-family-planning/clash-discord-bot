import {INTERNAL_ERROR} from '#src/disreact/model/internal/core/constants.ts';
import type * as FC from '#src/disreact/model/internal/core/fc.ts';
import type * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as P from 'effect/Predicate';

export const TypeId = Symbol.for('disreact/event');

export interface Event {
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

const Prototype = proto.declare<Event>({
  [TypeId]: TypeId,
  id      : '',
  property: '',
  target  : undefined,
  node    : undefined,
  next    : () => {},
  close   : () => {},
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

const HandlerPrototype = proto.declare<Handler>({
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

export const invoke = (handler: Handler, event: Event): E.Effect<void> => {
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
