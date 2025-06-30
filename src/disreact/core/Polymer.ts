import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as polymer from '#disreact/core/primitives/polymer.ts';
import type * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import {MONOMER_STATE, type MONOMER_CONTEXT, type MONOMER_EFFECT, type MONOMER_MEMO, type MONOMER_NONE, type MONOMER_REF, type MonomerTag} from '#src/disreact/core/primitives/constants.ts';
import type * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';
import type {Mutable} from 'effect/Types';

export interface BaseMonomer extends Pipeable.Pipeable, Inspectable.Inspectable {
  _tag    : MonomerTag;
  hydrate?: boolean;
  changed?: boolean;
  state?  : any;
  deps?   : any[] | undefined;
  effect? : EffectFn;
  current?: any;
  value?  : any;
}

export interface NoneMonomer extends BaseMonomer {
  _tag: typeof MONOMER_NONE;
}

export type NoneEncoded = [typeof MONOMER_NONE];

export interface StateMonomer extends BaseMonomer {
  _tag   : typeof MONOMER_STATE;
  changed: boolean;
  state  : any;
}

export type StateEncoded = [typeof MONOMER_STATE, any];

export interface EffectMonomer extends BaseMonomer {
  _tag: typeof MONOMER_EFFECT;
  deps: any[] | undefined;
  effect(): EffectOutput;
}

export type EffectEncoded = [typeof MONOMER_EFFECT, any[] | undefined];

export interface RefMonomer extends BaseMonomer {
  _tag   : typeof MONOMER_REF;
  current: any;
}

export type RefEncoded = [typeof MONOMER_REF, any];

export interface MemoMonomer extends BaseMonomer {
  _tag : typeof MONOMER_MEMO;
  value: any;
  deps : any[] | undefined;
}

export type MemoEncoded = [typeof MONOMER_MEMO, any[] | undefined];

export interface ContextMonomer extends BaseMonomer {
  _tag: typeof MONOMER_CONTEXT;
}

export type ContextEncoded = [typeof MONOMER_CONTEXT];

export type Monomer = | NoneMonomer
                      | StateMonomer
                      | EffectMonomer
                      | RefMonomer
                      | MemoMonomer
                      | ContextMonomer;

export type Encoded = | NoneEncoded
                      | StateEncoded
                      | EffectEncoded
                      | RefEncoded
                      | MemoEncoded;

export type EffectOutput = | void
                           | Promise<void>
                           | E.Effect<void>;

export type EffectFn = () => EffectOutput;

export interface Polymer extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage, Lateral.Lateral {
  document: Document.Document;
  node    : Node.Func;
  pc      : number;
  rc      : number;
  stack   : Monomer[];
  queue   : EffectMonomer[];
}

export const mount = (node: Node.Func): Polymer => {
  const self = polymer.empty();
  self.node = node;
  self.document = node.document;
  return self;
};

export const unmount = (self: Polymer) => {
  (self as any).document = undefined;
  (self as any).node = undefined;
};

export const hydrate = (node: Node.Node, stack: Monomer[]): Polymer => {
  return polymer.empty();
};

export const dehydrate = (self: Polymer): Monomer[] => {
  return [];
};


export const commit = (self: Polymer): Polymer => {
  for (let i = 0; i < self.stack.length; i++) {
    if (self.stack[i]._tag === MONOMER_STATE) {
      self.stack[i].changed = false;
    }
  }
  return self;
};

export const isChanged = (self: Polymer): boolean => {
  for (let i = 0; i < self.stack.length; i++) {
    if (self.stack[i]._tag === MONOMER_STATE) {
      if (self.stack[i].changed) {
        return true;
      }
    }
  }
  return false; // todo
};
