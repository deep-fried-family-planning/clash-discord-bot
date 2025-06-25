import type {ARRAY} from '#src/disreact/model/internal/core/constants.ts';
import {PROPS, type STRUCT} from '#src/disreact/model/internal/core/constants.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import * as MutableList from 'effect/MutableList';

const TypeId = Symbol.for('disreact/props');

export interface Props extends Equal.Equal, Hash.Hash {
  [TypeId]     : typeof PROPS;
  children?    : any;
  [key: string]: any;
};

export interface PropsStruct extends Record<string, any> {
  [TypeId]: typeof STRUCT;
}

export interface PropsArray extends type.Arr<any> {
  [TypeId]: typeof ARRAY;
};

const Prototype = proto.declare<Props>({
  [TypeId]: PROPS,
});

const StructPrototype = proto.declare<PropsStruct>({});

const ArrayPrototype = proto.declare<PropsArray>({});

export const make = (p: Record<string, any>) => {
  const props = {} as Props;

  const stack = MutableList.empty();
};
