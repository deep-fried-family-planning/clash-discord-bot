import * as Internal from '#disreact/model/runtime/internal.ts';
import * as E from 'effect/Effect';
import {globalValue} from 'effect/GlobalValue';
import type * as Inspectable from 'effect/Inspectable';

export type Value = | null
                    | undefined
                    | boolean
                    | number
                    | bigint
                    | string;

const TypeId: typeof Internal.JsxSymbol = Internal.JsxSymbol;

export type Type = | keyof JSX.IntrinsicElements
                   | typeof Fragment
                   | FC;

export interface Jsx<T extends Type = Type, P = any> extends Inspectable.Inspectable
{
  readonly [TypeId]   : typeof TypeId;
  readonly jsx        : boolean;
  readonly entrypoint?: string | undefined;
  readonly key        : string | undefined;
  readonly type       : T;
  readonly props      : P;
  readonly ref?       : any | undefined;
  readonly child?     : Child;
  readonly childs?    : Child[];
};

export interface FC<P = any> {
  displayName?: string;
  <E = never, R = never>(props: P):
    | Children
    | Promise<Children>
    | E.Effect<Children, E, R>;
}

export type Child = | Value
                    | Jsx;

export type Children = | Child
                       | readonly Child[];

export const isJsx = (u: Children): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

export const Fragment = Internal.FragmentSymbol;

export type Key = | string
                  | undefined;

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export const makeJsx = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Internal.makeJsx(type, setup, key);
  (self.child as any) = setup.children;
  return self;
};

export const makeJsxs = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Internal.makeJsx(type, setup, key);
  (self.jsx as any) = false;
  (self.childs as any) = setup.children;
  return self;
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

export const makeEntrypoint = (id: string, type: FC | Jsx): Entrypoint => {
  if (entries.has(id)) {
    throw new Error(`Duplicate entrypoint: ${id}`);
  }
  if (typeof type === 'function') {
    const fc = Internal.makeFC(type);
    fc.entrypoint = id;

    return entries
      .set(id, {
        id       : id,
        component: makeJsx(fc, {}),
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

export const findEntrypoint = (id: string | FC): Entrypoint | undefined => {
  if (typeof id === 'function') {
    if (!id.entrypoint) {
      return undefined;
    }
    return entries.get(id.entrypoint);
  }
  return entries.get(id);
};

export type Encoding = {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<string, (self: any, acc: any) => any>;
};

export const encode = (self: Jsx, encoding: Encoding): any => {
  const stack = [self];
  const acc = {};

  return {};
};
