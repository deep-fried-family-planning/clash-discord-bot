import type {Fibril} from '#src/disreact/model/entity/fibril.ts';

export * as Unsafe from './unsafe.ts';
export type Unsafe = never;

const internal = {
  mode: false,
  node: undefined as undefined | Fibril,
};

export const setMode = (mode: boolean) => {
  internal.mode = mode;
};

export const getMode = () => {
  return internal.mode;
};

export const setNode = (node?: Fibril) => {
  internal.node = node;
};

export const getNode = () => {
  if (internal.node === undefined) {
    throw new Error();
  }
  return internal.node;
};
