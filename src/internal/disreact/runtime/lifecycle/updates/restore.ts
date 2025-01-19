import {E} from '#pure/effect';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';


export const restore = E.fn('lifecycles.update.restore')(
  function * () {

  },
  SafeMutex.limit,
);
