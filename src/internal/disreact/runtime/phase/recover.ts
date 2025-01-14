import {E} from '#pure/effect';


export const recover = E.fn('recover')(
  function * () {
    yield * E.logTrace(`[commit]`);
  },
);
