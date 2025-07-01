/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as node from '#disreact/core/internal/node.ts';
import * as E from 'effect/Effect';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export interface Event<T = any> extends Pipeable.Pipeable, Inspectable.Inspectable {
  endpoint: string;
  id      : string;
  lookup  : string;
  handler : string;
  target  : any;
  data    : any;
  compare: {
    endpoint: string | null;
    props   : any;
  };
  close(): void;
  open(fc: any, props: any): void;
  open(node: any): void;
};

export const isClose = (event: Event) => event.compare.endpoint === null;

export const isChanged = (event: Event) => event.compare.endpoint !== event.endpoint;

export interface Handler<T = any> extends Function {
  (event?: Event<T>): | void
                      | Promise<void>
                      | E.Effect<void>;
}

type HandlerId = typeof node.HandlerId;

export interface PropsHandler<T = any> extends Handler<T>, Inspectable.Inspectable, Hash.Hash, Equal.Equal {
  [HandlerId]: HandlerId;
}

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
