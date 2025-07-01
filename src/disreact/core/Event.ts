import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as node from '#disreact/core/internal/node.ts';
import type {HandlerId} from '#disreact/core/internal/node.ts';
import * as E from 'effect/Effect';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export interface Event<T = any> extends Pipeable.Pipeable, Inspectable.Inspectable {
  source: string;
  target: T;
  close(): void;
  open(fc: any, props: any): void;
  open(node: any): void;
};

export interface InternalEvent<T = any> extends Event<T> {
  next : string;
  props: any;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface Handler<T = any> extends Function {
  (event?: Event<T>): | void
                     | Promise<void>
                     | E.Effect<void>;
}

type HandlerId = typeof node.HandlerId;

export interface PropsHandler<T = any> extends Handler<T>, Inspectable.Inspectable, Hash.Hash, Equal.Equal {
  [HandlerId]: HandlerId;
}

export const isStateless = (u: PropsHandler) => u.length === 0;

export const invokeStateless = (handler: PropsHandler): E.Effect<void> => {
  if (proto.isAsync(handler)) {
    return E.promise(handler as () => Promise<void>);
  }
  return E.suspend(() => {
    const out = handler();

    if (proto.isEffect<void>(out)) {
      return out;
    }
    return E.void;
  });
};

export const invoke = (event: Event, handler: Handler): E.Effect<void> => {
  if (proto.isAsync(handler)) {
    return E.promise(() => handler(event));
  }
  return E.suspend(() => {
    const out = handler(event);

    if (proto.isEffect<void>(out)) {
      return out;
    }
    return E.void;
  });
};
