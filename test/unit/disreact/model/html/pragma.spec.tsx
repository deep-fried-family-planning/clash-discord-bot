import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import {describe, expect, it} from 'vitest';

describe('pragma', () => {
  it('renders', async () => {
    const result = jsx(OmniPublic, {});

    await expect(result).toMatchFileSnapshot('./.snap/.pragma.spec.tsx.snap');
  });
});
