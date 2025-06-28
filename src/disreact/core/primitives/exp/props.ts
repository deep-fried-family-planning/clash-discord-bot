import {ARRAY, HANDLER, PROPS, STRUCT} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as type from '#src/disreact/core/primitives/type.ts';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as MutableList from 'effect/MutableList';

const TypeId = Symbol.for('disreact/props');

export interface Props {
  [TypeId]     : typeof PROPS;
  children?    : any | undefined;
  [key: string]: any;
};

export interface PropsStruct extends Record<string, any> {
  [TypeId]: typeof STRUCT;
}

export interface PropsArray extends type.Arr<any> {
  [TypeId]: typeof ARRAY;
};

export interface EventHandler<A, E = any, R = any> extends type.Fn {
  (event: A): | void
              | Promise<void>
              | E.Effect<void, E, R>;

  [TypeId]?: typeof HANDLER;
  [Hash.symbol]?(): number;
  [Equal.symbol]?(that: EventHandler<any>): boolean;
}

const Prototype = proto.type({
  [TypeId]: PROPS,
} as Props);

const StructPrototype = proto.type<PropsStruct>({
  [TypeId]: STRUCT,
});

const ArrayPrototype = proto.type<PropsArray>({
  [TypeId]: ARRAY,
});

const EventHandlerPrototype = proto.type<EventHandler<any>>({
  [TypeId]: HANDLER,
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: EventHandler<any>) {
    if (that[TypeId] === HANDLER) {
      return true;
    }
    return false;
  },
});

export const make = (p: Record<string, any>) => {
  const props = {} as Props;

  const stack = MutableList.empty();
};
