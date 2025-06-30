import type * as Polymer from '#disreact/core/Polymer.ts';
import * as document from '#disreact/core/primitives/document.ts';
import * as polymer from '#disreact/core/primitives/polymer.ts';

export const UseState = (self: Polymer.Polymer) => (initial: any) => {
  const monomer = polymer.state(initial);

  return [monomer.state, monomer.updater];
};

export const UseReducer = (self: Polymer.Polymer) => (initial: any, reducer: any) => {
  const monomer = polymer.reducer(initial, reducer);

  return [monomer.state, monomer.reducer];
};

export const UseEffect = (self: Polymer.Polymer) => (effect: any, deps?: any[]) => {
  const monomer = polymer.effect(effect, deps);
};

export const UseRef = (self: Polymer.Polymer) => (initial: any) => {
  const monomer = polymer.ref(initial);

  return monomer;
};

export const UseMemo = (self: Polymer.Polymer) => (fn:() => any, deps?: any[]) => {
  const monomer = polymer.memo(fn(), deps);

  return monomer.value;
};

export const UseCallback = (self: Polymer.Polymer) => (fn: () => any, deps?: any[]) => {
  const monomer = polymer.memo(fn, deps);

  return monomer.value;
};

export const UseContext = (self: Polymer.Polymer) => (context: any) => {
  const monomer = polymer.context();

  return monomer.value;
};
