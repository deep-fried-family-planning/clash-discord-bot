import {E, g, L} from '#pure/effect';
import type {EA} from '#src/internal/types.ts';


const implementation = E.gen(function * () {
  let permits = 1;
  const mutex = yield * E.makeSemaphore(permits);

  return {
    permits: () => permits,
    acquire: () => g(function * () {
      yield * mutex.take(1);
      permits--;
    }),
    release: () => g(function * () {
      yield * mutex.release(1);
      permits++;
    }),
  };
});


export class MutexBroker extends E.Tag('MutexManager')<
  MutexBroker,
  EA<typeof implementation>
>() {
  static singletonLayer = L.effect(this, implementation);
}
