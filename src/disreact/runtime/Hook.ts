import * as Polymer from '#disreact/model/entity/Polymer.ts';

export class HookError extends Error {
  _tag = 'HookError' as const;
}

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const UseInteraction = (self?: Polymer.Polymer) => () => {
  return self!.origin.env.data;
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
