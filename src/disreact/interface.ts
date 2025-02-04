/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any */
import {__hooks} from '#src/disreact/internal/globals.ts';



export const useState = <T>(initial: T): readonly [state: T, setState: (next: T | ((prev: T) => T)) => void] => {
  return __hooks().useState(initial) as any;
};



export const useReducer = (reducer: (state: any, action: any) => any, initialState: any) => {
  return __hooks().useReducer(reducer, initialState) as any;
};



export const useEffect = (effect: any, deps: any[]) => {
  __hooks().useEffect(effect, deps);
};



export const usePage = () => {
  return __hooks().usePage();
};
