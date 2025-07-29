import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as MutableRef from 'effect/MutableRef';

export interface Hook {
  pc   : number;
  rc   : number;
  stack: any[];
  queue: any[];
  flag : () => void;
}

export class HookError extends Error {
  _tag = 'HookError' as const;
}

export const current = MutableRef.make(undefined as undefined | Polymer.Hook);

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const UseInteraction = (self?: Polymer.Polymer) => () => {
  return self?.origin?.env.data;
};

export const UseReducer = (self?: Polymer.Polymer) => (reducer: any, initial: any) => {
  return [initial, () => {}];
};

export const UseState = (self?: Polymer.Polymer) => (initial: any) => {
  return [initial, () => {}];
};

export const UseEffect = (self?: Polymer.Polymer) => (effect: any, deps?: any[]) => {

};

export const UseRef = (self?: Polymer.Polymer) => (initial: any) => {
  return initial;
};

export const UseMemo = (self?: Polymer.Polymer) => (fn: () => any, deps?: any[]) => {
  return fn();
};

export const UseCallback = (self?: Polymer.Polymer) => (fn: () => any, deps?: any[]) => {
  return fn;
};

export const UseContext = (self?: Polymer.Polymer) => (context: any) => {
  return context;
};
