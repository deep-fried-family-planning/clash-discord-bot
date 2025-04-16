import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as ETree from '#src/disreact/model/meta/etree.ts';
export type ETree =
  | Leaf
  | Node;

export type Leaf =
  | string
  | number
  | bigint
  | true;

export const isLeaf = (x: ETree): x is Leaf =>
  typeof x === 'string' ||
  typeof x === 'number' ||
  typeof x === 'bigint' ||
  x === true;

export type Node = {
  elem   : Elem.Node;
  node?  : ETree;
  nodes? : ETree[];
  parent?: Elem.Node | undefined;
  id?    : string;
  idx?   : number;
};

export const isNode = (x: ETree): x is Node =>
  typeof x === 'object' &&
  x !== null;

export const makeNode = (elem: Elem.Node): Node => {
  return {
    elem,
  };
};
