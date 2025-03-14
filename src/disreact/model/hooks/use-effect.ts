import {FiberNode} from '#src/disreact/codec/fiber/index.ts';
import type {E} from '#src/internal/pure/effect.ts';
import * as HookFiber from './HookFiber.ts';



interface EffectFn {
  (): void;
  (): Promise<void>;
  (): E.Effect<void>;
}

export const hook = (effect: EffectFn, deps?: any[]): void => {
  const node = HookFiber.getNode();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = FiberNode.S.DepItem.make({d: deps ?? []});
  }

  const curr = node.stack[node.pc];

  if (!FiberNode.S.isDepItem(curr)) {
    throw new Error('Law of Hooks Violation: order of hooks is not preserved.');
  }



  node.pc++;
};
