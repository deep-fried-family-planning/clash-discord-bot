import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import type * as FiberState from '#src/disreact/codec/fiber/fiber-node.ts';



export type T = {
  root_id: string;
  props  : object | null;
  fibers : { [K in string]: FiberState.T };
  graph: {
    next     : string;
    nextProps: object | null;
  };
  rest: any;
};

export const make = (root_id?: string): T => ({
  root_id: root_id ?? EMPTY,
  props  : null,
  fibers : {},
  graph  : {
    next     : root_id ?? EMPTY,
    nextProps: null,
  },
  rest: null as any,
});
