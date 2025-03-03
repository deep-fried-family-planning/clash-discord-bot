import {NONE} from '#src/disreact/codec/common/index.ts';
import * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';
import * as MsgPack from '@msgpack/msgpack';
import {type Schema, String} from 'effect/Schema';
import * as pako from 'pako';



export const T = String;
export type T = Schema.Type<typeof T>;

export const isEmpty = (hash: T) => hash === NONE;
export const isEqual = (a: T, b?: T) => !isEmpty(a) || a === b;

export const make = (): T => NONE;

export const hash = (root: FiberRoot.T): T => {
  return compress({
    props: root.props,
    ...root.nodes,
  });
};

export const derive = (hash?: T): FiberRoot.T => {
  const root = FiberRoot.make();

  if (!hash || isEmpty(hash)) {
    return root;
  }

  const stacks = decompress(hash);

  for (const full_id of Object.keys(stacks)) {
    if (full_id === 'props') {
      root.props = stacks[full_id];
      continue;
    }

    const node          = FiberNode.make();
    node.stack          = stacks[full_id];
    root.nodes[full_id] = FiberNode.savePrior(node);
  }

  return root;
};

const compress = (data: any): string => {
  const binary     = MsgPack.encode(data);
  const compressed = pako.deflate(binary);

  return Buffer.from(compressed).toString('base64url');
};

const decompress = (url: string): any => {
  const compressed   = Buffer.from(url, 'base64url');
  const decompressed = pako.inflate(compressed);

  return MsgPack.decode(decompressed);
};
