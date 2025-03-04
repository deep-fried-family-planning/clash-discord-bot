import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import * as FiberRoot from '#src/disreact/codec/fiber/fiber-root.ts';
import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import {pipe, Record} from 'effect';
import type {Schema} from 'effect/Schema';
import {String} from 'effect/Schema';
import * as Compression from './compression.ts';



export const T = String;

export type T = Schema.Type<typeof T>;

export const Empty = EMPTY;

export const isEmpty = (hash: T): boolean => hash === NONE_STR;

export const hash = (root: FiberRoot.T): T => {
  return Compression.compress({
    props: root.props,
    ...pipe(root.fibers, Record.map((v) => v.stack)),
  });
};

export const decode = (hash?: T): FiberRoot.T => {
  const root = FiberRoot.make();

  if (!hash || isEmpty(hash)) {
    return root;
  }

  const stacks = Compression.decompress(hash);

  for (const [k, v] of Object.entries(stacks)) {
    if (k === 'props') {
      root.props = v;
      continue;
    }

    const node     = FiberNode.make();
    node.stack     = v;
    root.fibers[k] = FiberNode.commit(node);
  }

  return root;
};
