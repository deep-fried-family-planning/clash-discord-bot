import {E} from '#src/internal/pure/effect.ts';
import {inspect} from 'util';

describe('thing', () => {
  it('thing2', () => {
    const thing = E.fn(function * () {

    });

    console.log(inspect(thing(), false, null))

  })
});
