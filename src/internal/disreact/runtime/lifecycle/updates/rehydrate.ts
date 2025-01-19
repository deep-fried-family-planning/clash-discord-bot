import {E} from '#pure/effect';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';


export const rehydrate = E.fn('lifecycles.update.rehydrate')(
  function * () {

  },
  SafeMutex.limit,
);
