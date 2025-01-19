import {E} from '#pure/effect';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';


export const simulate = E.fn('lifecycles.update.simulate')(
  function * () {

  },
  SafeMutex.limit,
);
