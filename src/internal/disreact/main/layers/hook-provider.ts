import {E, g, L, pipe} from '#pure/effect';
import {Unsafe} from '#src/internal/disreact/entity/index.ts';
import type {EAR} from '#src/internal/types.ts';


const implementation = (

) => E.gen(function * () {
  const latch = yield * E.makeLatch(false);
  const mutex = yield * E.makeSemaphore(1);

  return {
    initialize: () => latch.open,

    lock: () => pipe(
      latch.await,
      E.tap(mutex.take(1)),
    ),

    collect: () => pipe(
      latch.await,
      E.as(({
        hooks    : {...Unsafe.hk_registry()},
        calls    : Unsafe.hk_calls(),
        next_node: Unsafe.get_next_node(),
      })),
    ),

    flush: () => pipe(
      latch.await,
      E.tap(E.sync(() => {
        Unsafe.hk_flush();
        Unsafe.set_next_node('');
      })),
    ),

    unlock: () => g(function * () {
      yield * latch.await;
      Unsafe.hk_flush();
      Unsafe.hk_unregister();
      Unsafe.set_next_node('');
      yield * mutex.release(1);
    }),
  };
});


export class HookProvider extends E.Tag('HookProvider')<
  HookProvider,
  EAR<typeof implementation>
>() {
  static defaultLayer = L.effect(this, implementation());
}
