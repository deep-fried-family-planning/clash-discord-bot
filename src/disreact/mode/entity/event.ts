/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';
import * as Data from 'effect/Data';

export declare namespace Event {
  export type Event = {
    id  : string;
    data: any;
  };
  export interface Handler extends Function {
    (event: Event.Event): void | Promise<void> | E.Effect<void, any, any>;
  }
}
export type Event = Event.Event;
export type Handler = Event.Handler;

export const make = (id: string, data: any): Event.Event =>
  ({
  id,
  data,
});

export class EventTargetError extends Data.TaggedError('EventTargetError')<{}> {}

export class EventHandlerError extends Data.TaggedError('EventHandlerError')<{
  cause: Error;
}> {}

export const invoke = (handler: Event.Handler, event: Event.Event) => {
  const out = handler(event);
  if (P.isPromise(out)) {
    return E.promise(async () => await out);
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  return E.void;
};
