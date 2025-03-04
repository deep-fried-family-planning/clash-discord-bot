/* eslint-disable @typescript-eslint/no-dynamic-delete,@typescript-eslint/no-unnecessary-condition */
import * as FiberNode from '#src/disreact/codec/entities/fiber-node.ts';
import * as FiberPointer from '#src/disreact/codec/entities/fiber-pointer.ts';
import * as FiberRoot from '#src/disreact/codec/entities/fiber-root.ts';
import * as Hooks from '#src/disreact/model/lifecycles/hooks.ts';


const __pointer = {current: null as null | FiberPointer.Type};

export const getPointer = () => {
  if (!__pointer.current) {
    throw new Error('Invalid: Called outside DisReact render functions.');
  }
  return __pointer.current;
};

export const setPointer = (ptr: FiberPointer.Type) => {
  __pointer.current = ptr;
};

export const unsetPointer = () => {
  __pointer.current = null;
};

export const nullifyPointer = () => {
  __pointer.current = FiberPointer.Null;
  return FiberPointer.Null;
};


const __roots = new WeakMap<FiberPointer.Type, FiberRoot.FiberRoot>();

export const mountRoot = (ptr: FiberPointer.Type, hydration = FiberRoot.make()) => {
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



export const mountFiber = (id: string, node = FiberNode.make()) => {
  const root = readRoot();

  root.fibers[id] = node;

  return node;
};

export const dismountFiber = (id: string) => {
  const node = readRoot().fibers[id];
  delete readRoot().fibers[id];
  return node;
};

export const readFiber = (id: string) => {
  const node = readRoot().fibers[id];

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

export const setDispatch = (state: FiberNode.FiberNode) => {
  __dispatch.current = Hooks.attachHooks(state);
};
