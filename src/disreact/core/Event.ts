import * as proto from '#disreact/core/behaviors/proto.ts';
import * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';

export interface AdaptorEvent {
  endpoint: string;
  id      : string;
  attr    : string;
  type    : string;
  target  : any;
}

export interface Event<T = any> {
  readonly id  : string;
  readonly attr: string;
  readonly type: string;
  readonly data: T;
  close(): void;
  open(element: Element.Element): void;
  open<A>(fc: FC.FC<A>, props: A): void;
}

export interface InternalEvent<T = any> extends Event<T> {
  readonly endpoint: string;
  readonly next: {
    endpoint: string | null;
    props   : any;
  };
}

export const make = (input?: AdaptorEvent): InternalEvent => {
  if (!input) {
    throw new Error();
  }

  const next: InternalEvent['next'] = {
    endpoint: input.endpoint,
    props   : {},
  };

  return {
    endpoint: input.endpoint,
    id      : input.id,
    attr    : input.attr,
    type    : input.type,
    data    : input.target,
    next,
    close() {
      this.next.endpoint = null;
    },
    open(type: FC.FC | Element.Element, props?: any) {
      if (typeof type === 'function') {
        const component = type as FC.Known;
        if (!props) {
          throw new Error();
        }
        if (!component.endpoint) {
          throw new Error();
        }
        this.next.endpoint = (type as FC.Known).endpoint!;
        this.next.props = props;
      }
      else {
        if (!type.endpoint) {
          throw new Error();
        }
        this.next.endpoint = type.endpoint!;
      }
    },
  };
};

export const isClose = (event: Event) => (event as InternalEvent).next.endpoint === null;

export const isSame = (event: Event) => (event as InternalEvent).next.endpoint === (event as InternalEvent).endpoint;

export const makePredicate = (event: Event) => (element: Element.Element): element is Element.Rest => {
  if (!Element.isInvokable(element)) {
    return false;
  }
  if (event.id === element.step) {
    return true;
  }
  if (event.id === element.props[event.attr]) {
    return true;
  }
  return false;
};

export interface Handler<T = any, E = never, R = never> {
  (event: Event<T>): | void
                     | Promise<void>
                     | E.Effect<void, E, R>;
}

export const invoke = (event: Event, handler: Handler): E.Effect<Event> => E.suspend(() => {
  if (proto.isAsync(handler)) {
    return E.promise(() => handler(event)).pipe(E.as(event));
  }
  const out = handler(event);

  if (P.isPromise(out)) {
    return E.promise(() => out).pipe(E.as(event));
  }
  if (proto.isEffect(out)) {
    return out.pipe(E.as(event));
  }
  return E.succeed(event);
});
