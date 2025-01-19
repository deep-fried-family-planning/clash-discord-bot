import {E} from '#pure/effect';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';


export const hydrate = E.fn('lifecycles.update.hydrate')(
  function * () {

  },
  SafeMutex.limit,
);
