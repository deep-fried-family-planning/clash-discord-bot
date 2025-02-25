/* eslint-disable @typescript-eslint/no-dynamic-delete,@typescript-eslint/no-unnecessary-condition */
import * as NodeState from '#src/disreact/codec/entities/node-state.ts';
import * as Pointer from '#src/disreact/codec/entities/pointer.ts';
import * as RootState from '#src/disreact/codec/entities/root-state.ts';
import * as Hooks from '#src/disreact/model/globals/hooks.ts';


const __pointer = {current: null as null | Pointer.Type};

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


const __roots = new WeakMap<Pointer.Type, RootState.Type>();

export const mountRoot = (ptr: Pointer.Type, hydration = RootState.make()) => {
  __roots.set(ptr, hydration);

  return hydration;
};

export const dismountRoot = (ptr = getPointer()) => {
  const root = __roots.get(ptr);

  __roots.delete(ptr);

  return root;
};

export const readRoot = (ptr = getPointer()) => {
  const root = __roots.get(ptr);

  if (!root) {
    throw new Error(`Internal: Root not found for id ${ptr.toString()}`);
  }

  return root;
};

export const mountNode = (id: string, node = NodeState.make()) => {
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



const __dispatch = {current: null as any};

export const getDispatch = () => {
  if (!__dispatch.current) {
    throw new Error('Invalid: Called outside DisReact render functions.');
  }
  return __dispatch.current;
};

export const setDispatch = (state: any) => {
  __dispatch.current = Hooks.attachHooks(state);
};
