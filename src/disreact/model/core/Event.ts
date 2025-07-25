import {ASYNC_CONSTRUCTOR} from '#disreact/util/constants.ts';
import * as Progress from '#disreact/model/core/Progress.ts';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';

export interface Event<T = any> extends Inspectable.Inspectable,
  Pipeable.Pipeable
{
  target: T;
  close(): void;
  open(type: any, props?: any): void;
}

export interface EventInput<T = any> {
  id    : string;
  type  : string;
  target: T;
}

export interface EventInternal<T = any> extends Event<T>, EventInput<T> {
  id    : string;
  type  : string;
  _state: {
    done      : boolean;
    origin    : string;
    entrypoint: string | null;
    props     : any;
  };
}

export const isClose = (event: EventInternal) => event._state.entrypoint === null;

export const isOpen = (event: EventInternal) => event._state.entrypoint !== event._state.entrypoint;

const EventProto: EventInternal = {
  id    : '',
  type  : '',
  _state: undefined as any,
  target: undefined as any,
  close() {
    if (this._state.done) {
      throw new Error('Event already done');
    }
    this._state.entrypoint = null;
    this._state.done = true;
  },
  open(type, props) {
    if (this._state.done) {
      throw new Error('Event already done');
    }
    this._state.entrypoint = type;
    this._state.props = props ?? {};
    this._state.done = true;
  },
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id   : 'Event',
      id    : this.id,
      type  : this.type,
      target: this.target,
    };
  },
};

export const make = (input: EventInput): EventInternal => {
  const self = Object.create(EventProto) as EventInternal;
  self.id = input.id;
  self.type = input.type;
  self.target = input.target;
  return self;
};

export const toProgress = (event: EventInternal): Progress.Change =>
  Progress.change(
    event._state.origin,
    event._state.entrypoint,
  );

export interface Handler<T = any> {
  <E = never, R = never>(event: Event<T>):
    | void
    | Promise<void>
    | E.Effect<void, E, R>;
}

export const invokeWith = dual<
  (handler: Handler) => (self: EventInternal) => E.Effect<EventInternal>,
  (self: EventInternal, handler: Handler) => E.Effect<EventInternal>
>(2, (self, handler) => {
  if (handler.constructor === ASYNC_CONSTRUCTOR) {
    return E.promise(() => handler(self) as Promise<void>).pipe(E.as(self));
  }
  return E.suspend(() => {
    const output = handler(self);

    if (P.isPromise(output)) {
      return E.promise(() => output).pipe(E.as(self));
    }
    if (E.isEffect(output)) {
      return output.pipe(E.as(self));
    }
    return E.succeed(self);
  });
});
