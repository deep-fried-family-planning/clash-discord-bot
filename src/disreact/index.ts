import type {RenderFn} from '#src/disreact/model/lifecycle.ts';
import * as Globals from '#src/disreact/model/globals/globals.ts';



export const useState = <T>(initial: T): readonly [state: T, setState: (next: T | ((prev: T) => T)) => void] => {
  return Globals.getDispatch().useState(initial);
};

export const useReducer = (reducer: (state: any, action: any) => any, initialState: any) => {
  return Globals.getDispatch().useReducer(reducer, initialState);
};

export const useEffect = (effect: any, deps?: any[]) => {
  Globals.getDispatch().useEffect(effect, deps);
};

export const useIx = () => {
  return Globals.getDispatch().useIx();
};

export const usePage = (fns: RenderFn[]) => {
  return Globals.getDispatch().usePage(fns);
};
