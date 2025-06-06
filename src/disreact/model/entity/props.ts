import type * as El from '#src/disreact/model/entity/element.ts';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Deps from '#src/disreact/model/util/deps.ts';
import console from 'node:console';

export const TypeId = Symbol.for('disreact/props');

export declare namespace Props {
  export type Props = Record<string, any>;
  export type NoChild = Props & {children?: never};
  export type AndChild = Props & {children: El.Node};
  export type AndChildren = Props & {children: El.Node[]};
}
export type Props = Props.Props;

const HANDLER_KEYS = [
  'onclick',
  'onselect',
  'onsubmit',
];

const StructProto = {
  [TypeId]: TypeId,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(TypeId in that) || that[TypeId] !== TypeId) {
      throw new Error('tsk tsk');
    }
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that as object);
    if (selfKeys.length !== thatKeys.length) {
      return false;
    }
    for (const key of selfKeys) {
      if (!(key in that) || !Equal.equals(this[key], that[key])) {
        return false;
      }
    }
    return true;
  },
};

import * as Proto from '#src/disreact/model/entity/proto.ts';
const ArrayProto = Object.assign(Proto.array(), {
  [TypeId]: TypeId,
  [Hash.symbol]() {
    return Hash.array(this as any);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(TypeId in that) || that[TypeId] !== TypeId) {
      throw new Error('tsk tsk');
    }
    if (!Array.isArray(that) || this.length !== that.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!Equal.equals(this[i], that[i])) {
        return false;
      }
    }
    return true;
  },
});

const isStruct = (p: any) => typeof p === 'object' && p[TypeId] === TypeId;

const struct = (p: any) =>
  Proto.pure(StructProto, p);

const isArray = (p: any) => Array.isArray(p) && TypeId in p && p[TypeId] === TypeId;

export const array = (p: any) =>
  Proto.pure(ArrayProto, p);

const makeInner = (p: any, fn?: El.Comp): Props.Props => {
  if (fn) {
    if (Deps.isItem(p) || Deps.isFn(p)) {
      console.log('dingding', p);
    }
  }
  if (!p || typeof p !== 'object') {
    return p;
  }
  if (Array.isArray(p)) {
    const acc = [] as any[];
    for (let i = 0; i < p.length; i++) {
      acc.push(makeInner(p[i]));
    }
    return Proto.pure(ArrayProto, acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) {
    acc[key] = makeInner(p[key]);
  }
  return Proto.pure(StructProto, acc);
};

export const make = (p: any, fn?: El.Comp): Props.Props => {
  if (!p || typeof p !== 'object') {
    throw new Error('must be object');
  }
  if (Array.isArray(p)) {
    throw new Error('cannot be array');
  }
  return makeInner(p, fn);
};

export const root = (p: any): Props.Props => {
  const cloned = structuredClone(p);
  return make(cloned);
};

export const handler = (props: any): El.Handler | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
};

export const extractKey = (props: any) => {
  if (props.key) {
    const key = props.key;
    delete props.key;
    return key;
  }
};
