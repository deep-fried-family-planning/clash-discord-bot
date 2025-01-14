import {E, g, L} from '#pure/effect';
import {UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import type {EAR} from '#src/internal/types.ts';


const implementation = () => E.gen(function * () {
  const mutex = yield * E.makeSemaphore(1);

  return {
    flushCalls: () => g(function * () {
      yield * mutex.take(1);
      const calls = [...UnsafeCall.flushCalls()];
      yield * mutex.release(1);
      return calls;
    }),
    flushHooks: () => g(function * () {
      yield * mutex.take(1);
      const hooks = [...UnsafeHook.flushHooks()];
      yield * mutex.release(1);
      return hooks;
    }),
    flushNext: () => g(function * () {
      yield * mutex.take(1);
      const params = UnsafeCall.flushNext();
      yield * mutex.release(1);
      return params;
    }),
  };
});


export class HookManager extends E.Tag('HookManager')<
  HookManager,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
