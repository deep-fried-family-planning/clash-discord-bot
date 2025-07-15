import * as elem from '#disreact/core/internal/element.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import * as Internal from '#disreact/model/runtime/internal.ts';
import {globalValue} from 'effect/GlobalValue';

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export type Child =
  | undefined | null
  | boolean | number | bigint | string
  | Jsx;

export type Children =
  | Child
  | readonly Child[];

export type Type =
  | string
  | typeof Fragment
  | Fn.JsxFC;

export const Fragment = Symbol.for('disreact/Fragment');

export interface Jsx<T extends Type = Type> {
  ref?   : any | undefined;
  key    : string | undefined;
  type   : T;
  props  : Setup;
  child? : Child;
  childs?: Child[];
  src?   : DevSrc | undefined;
  ctx?   : DevCtx | undefined;
};

export const isValue = (u: Children): u is Exclude<Child, Jsx> => typeof u !== 'object' || !u;

export const make = (type: Type, setup: Setup, key?: string): Jsx => {
  return {
    key  : key,
    type : type,
    props: setup,
    child: setup.children,
  };
};

export const makeMulti = (type: Type, setup: Setup, key?: string): Jsx => {
  return {
    key   : key,
    type  : type,
    props : setup,
    childs: setup.children,
  };
};

export const clone = <A extends Jsx>(self: A): A => {
  return {
    ...self,
    props: {...self.props},
  };
};

export interface Entrypoint {
  id       : string;
  component: Jsx;
}

const entries = globalValue(Fragment, () => new Map<string, Entrypoint>());

export const makeEntrypoint = (id: string, type: Fn.JsxFC | Jsx): Entrypoint => {
  if (entries.has(id)) {
    throw new Error(`Duplicate entrypoint: ${id}`);
  }
  if (typeof type === 'function') {
    const fc = Internal.makeFC(type);
    fc.entrypoint = id;

    return entries
      .set(id, {
        id       : id,
        component: make(fc, {}),
      })
      .get(id)!;
  }
  return entries
    .set(id, {
      id       : id,
      component: type,
    })
    .get(id)!;
};

export const findEntrypoint = (id: string | Fn.JsxFC): Entrypoint | undefined => {
  if (typeof id === 'function') {
    if (!id.entrypoint) {
      return undefined;
    }
    return entries.get(id.entrypoint);
  }
  return entries.get(id);
};

export type DevSrc = {};

export type DevCtx = {};

export const makeDEV = (
  type: Type,
  setup: Setup,
  key: string | undefined,
  src: DevSrc,
  ctx: DevCtx,
): Jsx => {
  let elem: Jsx;
  if (Array.isArray(setup.children)) {
    elem = makeMulti(type, setup, key);
  }
  else {
    elem = make(type, setup, key);
  }
  elem.src = src;
  elem.ctx = ctx;
  return elem;
};
