/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any */
import {getDispatcher} from '#src/disreact/internal/globals.ts';

export const useState = <T>(initial: T): readonly [state: T, setState: (next: T | ((prev: T) => T)) => void] => {
  return getDispatcher().useState(initial) as any;
};

export const useReducer = (reducer: (state: any, action: any) => any, initialState: any) => {
  return getDispatcher().useReducer(reducer, initialState) as any;
};

export const useEffect = (effect: any, deps: any[]) => {
  getDispatcher().useEffect(effect, deps);
};
