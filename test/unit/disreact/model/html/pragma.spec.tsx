import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import console from 'node:console';
import {inspect} from 'node:util';
import {describe, it } from 'vitest';

describe('pragma', () => {
  it('ope', () => {
    console.log('pragma');
    console.log(inspect(jsx(OmniPublic, {}), false, null, true));
  });
});
