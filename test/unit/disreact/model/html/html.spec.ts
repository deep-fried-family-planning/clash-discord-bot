import {DFMD, DTML} from '#src/disreact/dsx/config.ts';
import {it} from '@effect/vitest';


describe('disreact.model.html', () => {
  it('has no conflicting intrinsic tags', () => {
    const actual = {...DFMD, ...DTML};

    for (const tag of Object.keys(DTML)) {
      expect(actual[tag]).toEqual(DTML[tag]);
    }
    for (const tag of Object.keys(DFMD)) {
      expect(actual[tag]).toEqual(DFMD[tag]);
    }
  });
});
