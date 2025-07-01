/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as proto from '#disreact/core/behaviors/proto.ts';
import * as FC from '#disreact/core/FC.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';

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
  open(node: Node.Node): void;
  openFC<P>(component: FC.FC<P>, props: P): void;
}

export interface EventInternal<D = any, T = any> extends EventInput<D, T>, Event<D, T>, Inspectable.Inspectable {
  compare: {
    endpoint: string | null;
    props   : any;
  };
}

const EventPrototype = proto.type<EventInternal>({
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'Event',
    });
  },
  close() {
    this.compare!.endpoint = null;
  },
  openFC<P>(component: FC.FC<P>, props: P) {
    if (!props) {
      throw new Error();
    }
    this.compare!.endpoint = FC.name(component);
    this.compare!.props = props;
  },
  open(node) {
    if (!node.source) {
      throw new Error();
    }
    this.compare!.endpoint = node.source;
    this.compare!.props = node.props;
  },
});

export const event = (input: EventInput) =>
  proto.init(EventPrototype, {
    ...input,
    compare: {
      endpoint: input.endpoint,
      props   : {},
    },
  });

export const isClose = (event: EventInternal) => event.compare.endpoint === null;

export const isChanged = (event: EventInternal) => event.compare.endpoint !== event.endpoint;

export interface Handler<D = any, T = any, E = never, R = never> extends Function {
  (event: Event<D, T>): | void
                        | Promise<void>
                        | E.Effect<void, E, R>;
}

export const HandlerId = Symbol.for('disreact/handler');

export interface EventHandler<D = any, T = any, E = never, R = never> extends Handler<D, T, E, R>,
  Inspectable.Inspectable,
  Hash.Hash,
  Equal.Equal
{
  [HandlerId]: typeof HandlerId;
}

const HandlerPrototype = proto.type<EventHandler>({
  [HandlerId]: HandlerId,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'EventHandler',
    });
  },
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: EventHandler) {
    return that[HandlerId] === HandlerId;
  },
});

export const handler = (fn: Handler) => proto.init(HandlerPrototype, fn);

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
