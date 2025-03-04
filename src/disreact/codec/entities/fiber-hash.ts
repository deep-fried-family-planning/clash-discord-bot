import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import {pipe, Record} from 'effect';
import type {Schema} from 'effect/Schema';
import {String} from 'effect/Schema';
import * as FiberNode from 'src/disreact/codec/entities/fiber-node.ts';
import * as FiberRoot from 'src/disreact/codec/entities/fiber-root.ts';
import * as Compression from './compression.ts';



export const FiberHash = String;

export type FiberHash = Schema.Type<typeof FiberHash>;

export const Empty = EMPTY;

export const isEmpty = (hash: FiberHash): boolean => hash === NONE_STR;

export const hash = (root: FiberRoot.FiberRoot): FiberHash => {
  return Compression.compressStack({
    props: root.props,
    ...pipe(
      root.fibers,
      Record.map((v) => v.stack),
    ),
  });
};

export const decode = (hash?: FiberHash): FiberRoot.FiberRoot => {
  const root = FiberRoot.make();

  if (!hash || isEmpty(hash)) {
    return root;
  }

  const stacks = Compression.decompressStack(hash);

  for (const [k, v] of Object.entries(stacks)) {
    if (k === 'props') {
      root.props = v;
      continue;
    }

    const node     = FiberNode.make();
    node.stack     = v;
    root.fibers[k] = FiberNode.savePrior(node);
  }

  return root;
};
