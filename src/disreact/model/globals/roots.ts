import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import * as Pointer from './pointer.ts';
import type * as Nodes from '#src/disreact/model/globals/nodes.ts';



export const make = () => ({
  props: {} as any,
  store: {},
  diffs: [] as any[],
  state: new Map<string, Nodes.Type>(),
  graph: {
    next     : NONE_STR,
    nextProps: null as any,
  },
  rest: null as any,
});

export type Type = ReturnType<typeof make>;



const roots = new WeakMap<Pointer.Type, Type>();



export const mount = (ptr: Pointer.Type) => {
  const root = make();
  roots.set(ptr, root);
  return root;
};



export const dismount = (ptr: Pointer.Type) => {
  return roots.delete(ptr);
};



export const current = () => {
  const ptr = Pointer.current();
  const root = roots.get(ptr);

  if (!root) {
    throw new Error(`Internal: No root found for current pointer ${ptr.toString()}`);
  }

  return root;
};
