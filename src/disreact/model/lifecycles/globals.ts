/* eslint-disable @typescript-eslint/no-dynamic-delete,@typescript-eslint/no-unnecessary-condition */
import {FiberNode, FiberPointer, FiberRoot} from '#src/disreact/codec/dsx/fiber/index.ts';
import * as Hooks from '#src/disreact/model/lifecycles/hooks.ts';


const __pointer = {current: null as null | FiberPointer.T};

export const getPointer = () => {
  if (!__pointer.current) {
    throw new Error('Invalid: Called outside DisReact render functions.');
  }
  return __pointer.current;
};

export const setPointer = (ptr: FiberPointer.T) => {__pointer.current = ptr};

export const releasePointer = () => {__pointer.current = null};

export const nullifyPointer = () => __pointer.current = FiberPointer.Null;



const __roots = new WeakMap<FiberPointer.T, FiberRoot.T>();

export const mountFiberRoot = (ptr: FiberPointer.T, hydration = FiberRoot.make()) => {
  __roots.set(ptr, hydration);

  return hydration;
};

export const dismountFiberRoot = (ptr = getPointer()) => {
  const root = __roots.get(ptr);

  __roots.delete(ptr);

  return root;
};

export const getFiberRoot = (ptr = getPointer()) => {
  const root = __roots.get(ptr);

  if (!root) {
    throw new Error(`Internal: Root not found for id ${ptr.toString()}`);
  }

  return root;
};



export const mountFiberNode = (id: string, node = FiberNode.make()) => {
  const root = getFiberRoot();

  root.nodes[id] = node;

  return node;
};

export const dismountFiberNode = (id: string) => {
  const node = getFiberRoot().nodes[id];
  delete getFiberRoot().nodes[id];
  return node;
};

export const getFiberNode = (id: string) => {
  const node = getFiberRoot().nodes[id];

  if (!node) {
    throw new Error(`Internal: Node not found for id ${id}`);
  }

  return node;
};



const __dispatch = {current: null as null | ReturnType<typeof Hooks.attachHooks>};

export const getDispatch = () => {
  if (!__dispatch.current) {
    throw new Error('Invalid: Called outside DisReact render functions.');
  }
  return __dispatch.current;
};

export const setDispatch = (state: any) => {
  __dispatch.current = Hooks.attachHooks(state);
};
