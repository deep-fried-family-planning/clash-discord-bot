import type * as FiberState from '#src/disreact/codec/entities/fiber-node.ts';
import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import * as FiberHash from './fiber-hash.ts';


export type FiberRoot = {
  props : object | null;
  fibers: { [K in string]: FiberState.FiberNode };
  graph: {
    next     : string;
    nextProps: object | null;
  };
  rest: any;
};

export const make = (): FiberRoot => ({
  props : null,
  fibers: {},
  graph : {
    next     : NONE_STR,
    nextProps: null,
  },
  rest: null as any,
});

export const makeFromHash = (hash: string) => FiberHash.decode(hash);
