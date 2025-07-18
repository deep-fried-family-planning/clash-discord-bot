import * as Polymer from '#disreact/model/entity/Polymer.ts';

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const UseIx = (self?: Polymer.Polymer) => () => {
  return self!.origin._env.data;
};

export const UseState = (self?: Polymer.Polymer) => (initial: any) => {
  const polymer = Polymer.assert(self);


  return [initial, () => {}];
};

export const UseEffect = (self?: Polymer.Polymer) => (effect: any, deps?: any[]) => {
  const polymer = Polymer.assert(self);
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
