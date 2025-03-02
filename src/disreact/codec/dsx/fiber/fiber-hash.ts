import {NONE} from '#src/disreact/codec/common/index.ts';
import * as FiberNode from '#src/disreact/codec/dsx/fiber/fiber-node.ts';
import type * as FiberRoot from '#src/disreact/codec/dsx/fiber/fiber-root.ts';
import {S} from '#src/internal/pure/effect.ts';
import * as MsgPack from '@msgpack/msgpack';
import * as pako from 'pako';



export const T = S.Struct({
  props: S.Any,
  nodes: S.Record({
    key  : S.String,
    value: FiberNode.T,
  }),
});

export type T =
  S.Schema.Type<typeof T>
  & {
    nodes: FiberNode.TRecord;
  };

export const Encoded = S.String;
export type Encoded = S.Schema.Type<typeof Encoded>;

export const isEmpty   = (hash: Encoded): boolean => hash === NONE;
export const isEqual   = (a: Encoded, b?: Encoded): boolean => !isEmpty(a) || a === b;
export const makeEmpty = (): Encoded => NONE;
export const empty     = NONE;

export const hashFiberRoot = (state: FiberRoot.T): Encoded => {
  return compressStack({
    props: state.props,
    ...state.nodes,
  });
};

export const makeFiberRoot = (hash: Encoded): T => {
  const stacks = decompressStack(hash);

  const acc = {
    props : null,
    fibers: {} as FiberNode.TRecord,
  } as any;

  for (const [k, v] of Object.entries(stacks)) {
    if (k === 'props') {
      acc.props = v;
      continue;
    }

    acc.fibers[k]       = FiberNode.make();
    acc.fibers[k].stack = v;
    FiberNode.savePrior(acc[k]);
  }

  return acc;
};

const compressStack = (data: Record<string, any>): string => {
  const binary     = MsgPack.encode(data);
  const compressed = pako.deflate(binary);

  return Buffer.from(compressed).toString('base64url');
};

const decompressStack = (url: string): Record<string, any> => {
  const compressed   = Buffer.from(url, 'base64url');
  const decompressed = pako.inflate(compressed);

  return MsgPack.decode(decompressed) as Record<string, any>;
};
