import type * as FiberState from '#src/disreact/codec/fiber/fiber-node.ts';
import {NONE_STR} from '#src/disreact/codec/rest/index.ts';



export type T = {
  props : object | null;
  fibers: { [K in string]: FiberState.T };
  graph: {
    next     : string;
    nextProps: object | null;
  };
  rest: any;
};

export const make = (): T => ({
  props : null,
  fibers: {},
  graph : {
    next     : NONE_STR,
    nextProps: null,
  },
  rest: null as any,
});
