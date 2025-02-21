/* eslint-disable @typescript-eslint/no-dynamic-delete,@typescript-eslint/no-unnecessary-condition */
import * as NodeState from '../codec/entities/node-state.ts';
import * as Pointer from '../codec/entities/pointer.ts';
import * as RootState from '../codec/entities/root-state.ts';



const __pointer  = {current: null as null | Pointer.Type};
const __roots    = new WeakMap<Pointer.Type, RootState.Type>();
const __dispatch = {current: null as any};



export const getPointer = () => {
  if (!__pointer.current) {
    throw new Error('Invalid: Called outside DisReact render functions.');
  }
  return __pointer.current;
};

export const setPointer = (ptr: Pointer.Type) => {
  __pointer.current = ptr;
};

export const unsetPointer = () => {
  __pointer.current = null;
};

export const nullifyPointer = () => {
  __pointer.current = Pointer.Null;
  return Pointer.Null;
};



export const mountRoot = (ptr: Pointer.Type) => {
  const root = RootState.make();

  __roots.set(ptr, root);

  return root;
};

export const dismountRoot = (ptr: Pointer.Type) => {
  const root = __roots.get(ptr);

  __roots.delete(ptr);

  return root;
};

export const readRoot = () => {
  const ptr  = getPointer();
  const root = __roots.get(ptr);

  if (!root) {
    throw new Error(`Internal: Root not found for id ${ptr.toString()}`);
  }

  return root;
};



export const mountNode = (id: string) => {
  const node = NodeState.make();
  const root = readRoot();

  root.state[id] = node;

  return node;
};

export const dismountNode = (id: string) => {
  const node = readRoot().state[id];
  delete readRoot().state[id];
  return node;
};

export const readNode = (id: string) => {
  const node = readRoot().state[id];

  if (!node) {
    throw new Error(`Internal: Node not found for id ${id}`);
  }

  return node;
};
