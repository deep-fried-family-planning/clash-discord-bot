import {NONE} from '#src/disreact/codec/common/index.ts';
import type * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';



export type T = {
  request: any;
  props  : any;
  graph: {
    root : string;
    props: any;
  };
  nodes: FiberNode.Rec;
};

export const make = (): T => ({
  request: null,
  props  : null,
  graph  : {
    root : NONE,
    props: null,
  },
  nodes: {},
});
