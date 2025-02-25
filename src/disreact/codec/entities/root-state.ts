import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import * as NodeState from '#src/disreact/codec/entities/node-state.ts';
import * as Compression from '#src/disreact/codec/rest/compression.ts';



export type Type = {
  props: object | null;
  store: object;
  diffs: any[];
  state: {[K in string]: NodeState.Type};
  graph: {
    next     : string;
    nextProps: object | null;
  };
  rest: any;
};

export const make = (): Type => ({
  props: null,
  store: {},
  diffs: [],
  state: {},
  graph: {
    next     : NONE_STR,
    nextProps: null,
  },
  rest: null as any,
});



export const ROOT_PROPS_KEY = '.rootProps';

export const makeHash = (root: Type) => {
  const acc = {} as any;
  acc[ROOT_PROPS_KEY] = root.props;

  for (const [k, v] of Object.entries(root.state)) {
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
      root.state[k] = NodeState.make();
      root.state[k].stack = v;
      NodeState.savePrior(root.state[k]);
    }
  }

  return root;
};
