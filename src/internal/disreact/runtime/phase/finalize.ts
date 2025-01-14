import {E} from '#pure/effect';


export const finalize = E.fn('finalize')(
  function * () {
    yield * E.logTrace(`[finalize]`);
  },
);
