import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import * as RootState from './root-state.ts';
import type * as FiberState from './fiber-state.ts';
import * as Compression from '#src/disreact/codec/rest/compression.ts';



export type Encoded = string;

export type Type = {
  props : object | null;
  fibers: {[K in string]: FiberState.Type};
};



export const hash = (state: RootState.Type): Encoded => {
  return NONE_STR;
};



export const unhash = (hash: Encoded): Type => {
  return RootState.make();
};



export const isEmpty = (hash: Encoded): boolean => hash === NONE_STR;
