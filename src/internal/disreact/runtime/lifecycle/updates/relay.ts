import {E} from '#pure/effect';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';


export const relay = E.fn('lifecycles.update.relay')(
  function * () {

  },
  SafeMutex.limit,
);
