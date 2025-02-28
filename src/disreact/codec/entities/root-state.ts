import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import * as FiberState from '#src/disreact/codec/entities/fiber-state.ts';
import * as Compression from '#src/disreact/codec/entities/compression.ts';
import type * as RootHash from '#src/disreact/codec/entities/root-hash.ts';


export type Type = {
  props : object | null;
  store : object;
  diffs : any[];
  fibers: {[K in string]: FiberState.Type};
  graph: {
    next     : string;
    nextProps: object | null;
  };
  rest: any;
};

export const make = (): Type => ({
  props : null,
  store : {},
  diffs : [],
  fibers: {},
  graph : {
    next     : NONE_STR,
    nextProps: null,
  },
  rest: null as any,
});

export const makeFrom = (hash: RootHash.Type) => {
  const root = make();
  root.props = hash.props;
  root.fibers = hash.fibers;
  return root;
};



export const ROOT_PROPS_KEY = '.rootProps';

export const makeHash = (root: Type) => {
  const acc = {} as any;
  acc[ROOT_PROPS_KEY] = root.props;

  for (const [k, v] of Object.entries(root.fibers)) {
    acc[k] = v.stack;
  }

  return Compression.compressStack(acc);
};

export const makeFromHash = (hash: string) => {
  const unhashed = Compression.decompressStack(hash);

  const root = make();

  root.props = unhashed[ROOT_PROPS_KEY] ?? {};

  for (const [k, v] of Object.entries(unhashed)) {
    switch (k) {
    case ROOT_PROPS_KEY:
      root.props = v ?? {};
      continue;

    default:
      root.fibers[k]       = FiberState.make();
      root.fibers[k].stack = v;
      FiberState.savePrior(root.fibers[k]);
    }
  }

  return root;
};
