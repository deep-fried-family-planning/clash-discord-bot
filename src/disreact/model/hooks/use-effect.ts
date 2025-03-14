/* eslint-disable @typescript-eslint/no-invalid-void-type */
import {HookError} from '#src/disreact/codec/error.ts';
import {Hydrant} from '#src/disreact/model/hooks/fiber-hydrant.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import type {E} from '#src/internal/pure/effect.ts';



interface EffectFn {
  (): void | Promise<void> | E.Effect<void>;
}

export const $useEffect = (effect: EffectFn | void, deps?: any[]): void => {
  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new HookError({
            message: `Unsupported hook dependency type: ${dep.toString()}`,
          });
      }
    }
  }

  const node = FiberNode.λ_λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = {d: deps ?? []};
  }

  const curr = node.stack[node.pc];

  if (!Hydrant.Stack.isDep(curr)) {
    throw new HookError({message: 'Hooks must be called in the same order'});
  }

  node.pc++;

  if (node.rc === 0) {
    node.queue.push(effect);
    return;
  }

  if (!deps) {
    return;
  }

  if (curr.d.length !== deps.length) {
    throw new HookError({message: 'Hook dependency length mismatch'});
  }

  if (curr.d.length === 0 && deps.length === 0) {
    node.queue.push(effect);
    return;
  }

  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== curr.d[i]) {
      curr.d = deps;
      node.queue.push(effect);
      break;
    }
  }
};
