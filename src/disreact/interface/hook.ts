/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any */
import {HookDispatch} from '#src/disreact/internal/dsx-hooks/HookDispatch.ts';
import type {RenderFn} from '#src/disreact/internal/types.ts';



export const useState = <T>(initial: T): readonly [state: T, setState: (next: T | ((prev: T) => T)) => void] => {
  return HookDispatch.__hooks().useState(initial) as any;
};

export const useReducer = (reducer: (state: any, action: any) => any, initialState: any) => {
  return HookDispatch.__hooks().useReducer(reducer, initialState) as any;
};

export const useEffect = (effect: any, deps?: any[]) => {
  HookDispatch.__hooks().useEffect(effect, deps);
};

export const useIxData = () => {
  return HookDispatch.__hooks().useIxData();
};

export const usePage = (fns: RenderFn[]) => {
  return HookDispatch.__hooks().usePage(fns);
};
