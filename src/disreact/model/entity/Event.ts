import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

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
    this._state.entrypoint = null;
  },
  open(type, props) {
    this._state.entrypoint = type;
    this._state.props = props ?? {};
  },
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Event',
      id    : this.id,
      type  : this.type,
      target: this.target,
    });
  },
};

export const make = (input: EventInput): EventInternal => {
  const self = Object.create(EventProto) as EventInternal;
  self.id = input.id;
  self.type = input.type;
  self.target = input.target;
  return self;
};
