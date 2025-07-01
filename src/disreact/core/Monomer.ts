import type {EffectFn, EffectOutput} from '#disreact/core/Polymer.ts';
import * as polymer from '#disreact/core/primitives/polymer.ts';
import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF, MONOMER_STATE, type MonomerTag} from '#src/disreact/core/primitives/constants.ts';
import type * as Inspectable from 'effect/Inspectable';
import type * as Polymer from '#disreact/core/Polymer.ts';

export interface BaseMonomer extends Inspectable.Inspectable {
  _tag    : MonomerTag;
  hydrate?: boolean;
  changed?: boolean;
  state?  : any;
  deps?   : any[] | undefined;
  fn?     : Polymer.EffectFn;
  fx?     : Polymer.Effect;
  current?: any;
  value?  : any;
}

export interface NoneMonomer extends BaseMonomer {
  _tag: typeof MONOMER_NONE;
}

export type NoneEncoded = typeof MONOMER_NONE;

export interface StateMonomer extends BaseMonomer {
  _tag   : typeof MONOMER_STATE;
  changed: boolean;
  state  : any;
  updater(next: any): void;
}

export type StateEncoded = [typeof MONOMER_STATE, any];

export interface ReducerMonomer extends BaseMonomer {
  _tag   : typeof MONOMER_REDUCER;
  changed: boolean;
  state  : any;
  reducer(state: any, action: any): any;
}

export type ReducerEncoded = [typeof MONOMER_REDUCER, any];

export interface Effect extends BaseMonomer {
  _tag: typeof MONOMER_EFFECT;
  deps: any[] | undefined;
  fn?(): Polymer.EffectOutput;
  fx? : Polymer.Effect;
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
  _tag: typeof MONOMER_CONTEXTUAL;
}

export type ContextEncoded = [typeof MONOMER_CONTEXTUAL];

export type Monomer = | NoneMonomer
                      | StateMonomer
                      | ReducerMonomer
                      | Effect
                      | RefMonomer
                      | MemoMonomer
                      | ContextMonomer;

export type Encoded = | NoneEncoded
                      | StateEncoded
                      | ReducerEncoded
                      | EffectEncoded
                      | RefEncoded
                      | MemoEncoded
                      | ContextEncoded;

export const isChanged = (monomer: Monomer): boolean => {
  switch (monomer._tag) {
    case MONOMER_STATE:
    case MONOMER_REDUCER:{
      return monomer.changed;
    }
  }
  return false;
};

export const hydrateMonomer = (monomer: Encoded): Monomer => {
  if (monomer === MONOMER_NONE) {
    return polymer.none();
  }
  switch (monomer[0]) {
    case MONOMER_STATE: {
      return polymer.state(monomer[1]);
    }
    case MONOMER_REDUCER: {
      return polymer.reducer(monomer[1], undefined);
    }
    case MONOMER_EFFECT: {
      return polymer.effect(undefined, monomer[1]);
    }
    case MONOMER_REF: {
      return polymer.ref(monomer[1]);
    }
    case MONOMER_MEMO: {
      return polymer.memo(undefined, monomer[1]);
    }
    case MONOMER_CONTEXTUAL: {
      return polymer.context();
    }
  }
};

export const dehydrateMonomer = (monomer: Monomer): Encoded => {
  switch (monomer._tag) {
    case MONOMER_NONE: {
      return MONOMER_NONE;
    }
    case MONOMER_STATE: {
      return [MONOMER_STATE, monomer.state];
    }
    case MONOMER_REDUCER: {
      return [MONOMER_REDUCER, monomer.state];
    }
    case MONOMER_EFFECT: {
      return [MONOMER_EFFECT, monomer.deps];
    }
    case MONOMER_REF: {
      return [MONOMER_REF, monomer.current];
    }
    case MONOMER_MEMO: {
      return [MONOMER_MEMO, monomer.deps];
    }
    case MONOMER_CONTEXTUAL: {
      return [MONOMER_CONTEXTUAL];
    }
  }
};
