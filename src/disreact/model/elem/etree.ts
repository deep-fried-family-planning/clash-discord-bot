import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as ETree from 'src/disreact/model/elem/etree.ts';
export type ETree =
  | Leaf
  | Node;

export type Leaf =
  | string
  | number
  | bigint
  | true;

export type Node = {
  id     : string;
  idx    : number;
  elem   : Elem.Node;
  nodes  : ETree[];
  parent?: Elem.Node | undefined;
};
