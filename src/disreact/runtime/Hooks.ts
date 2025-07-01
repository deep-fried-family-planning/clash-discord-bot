import type * as Polymer from '#disreact/core/Polymer.ts';
import * as document from '#disreact/core/primitives/document.ts';
import * as polymer from '#disreact/core/primitives/polymer.ts';

type ActivePolymer = {
  polymer: Polymer.Polymer;
};

export const UseInteraction = (self: ActivePolymer) => (interaction: any) => {
  const monomer = polymer.none();

  return self.polymer.document.interaction;
};

export const UseState = (self: ActivePolymer) => (initial: any) => {
  const monomer = polymer.state(initial);

  return [monomer.state, monomer.updater];
};

export const UseReducer = (self: ActivePolymer) => (initial: any, reducer: any) => {
  const monomer = polymer.reducer(initial, reducer);

  return [monomer.state, monomer.reducer];
};

export const UseEffect = (self: ActivePolymer) => (effect: any, deps?: any[]) => {
  const monomer = polymer.effect(effect, deps);
};

export const UseRef = (self: ActivePolymer) => (initial: any) => {
  const monomer = polymer.ref(initial);

  return monomer;
};

export const UseMemo = (self: ActivePolymer) => (fn:() => any, deps?: any[]) => {
  const monomer = polymer.memo(fn(), deps);

  return monomer.value;
};

export const UseCallback = (self: ActivePolymer) => (fn: () => any, deps?: any[]) => {
  const monomer = polymer.memo(fn, deps);

  return monomer.value;
};

export const UseContext = (self:ActivePolymer) => (context: any) => {
  const monomer = polymer.context();

  return monomer.value;
};

export const getHooks = (self: ActivePolymer) => {
  return {
    useInteraction: UseInteraction(self),
    useState      : UseState(self),
    useReducer    : UseReducer(self),
    useEffect     : UseEffect(self),
    useRef        : UseRef(self),
    useMemo       : UseMemo(self),
    useCallback   : UseCallback(self),
    useContext    : UseContext(self),
  };
};

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const hooks = getHooks(active as ActivePolymer);
