import {NONE} from '#src/disreact/codec/common/index.ts';
import * as FiberHash from '#src/disreact/codec/dsx/fiber/fiber-hash.ts';
import * as FiberNode from '#src/disreact/codec/dsx/fiber/fiber-node.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  id     : S.String,
  root_id: S.String,
  request: S.Any,
  nodes  : S.mutable(S.Record({
    key  : S.String,
    value: FiberNode.T,
  })),
  props: S.Any,
  graph: S.mutable(S.Struct({
    root : S.String,
    props: S.Any,
  })),
});

const t = S.mutable(T);

export type T = S.Schema.Type<typeof t> & {
  nodes: FiberNode.TRecord;
};

export const make = (): T => ({
  request: null,
  id     : NONE,
  root_id: NONE,
  props  : null,
  graph  : {
    root : NONE,
    props: null,
  },
  nodes: {},
});

export const hydrate = (hash?: FiberHash.Encoded): T => {
  const root = make();

  if (!hash || FiberHash.isEmpty(hash)) {
    return root;
  }

  const deserialized = FiberHash.makeFiberRoot(hash);

  root.props = deserialized.props;
  root.nodes = deserialized.nodes;

  return root;
};
