import {CLOSE} from '#src/disreact/codec/constants/common.ts';
import {HookError} from '#src/disreact/codec/error.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import {Hydrant} from '#src/disreact/model/entity/fiber-hydrant.ts';
import {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';



export const $useIx = () => {
  const node = FiberNode.λ_λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Hydrant.Stack.isNull(node.stack[node.pc])) {
    throw new HookError({message: 'Hooks must be called in the same order'});
  }

  node.pc++;

  return node.root?.request;
};

export const $useMessage = (_: FC[]) => {
  const node = FiberNode.λ_λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Hydrant.Stack.isNull(node.stack[node.pc])) {
    throw new HookError({message: 'Hooks must be called in the same order'});
  }

  node.pc++;

  return {
    next: (next: FC, props: any = {}) => {
      // RootRegistry.UNSAFE_assert(next);

      node.root!.next.id    = next.name;
      node.root!.next.props = props;
    },

    close: () => {
      node.root!.next.id = CLOSE;
    },
  };
};
