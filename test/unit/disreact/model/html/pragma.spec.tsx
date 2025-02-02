import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import {jsxrest} from '#src/disreact/model/pragma.tsx';
import {describe, expect, it} from 'vitest';

describe('pragma', () => {
  it('renders intrinsic', async () => {


    await expect(jsx('embed')).toMatchFileSnapshot('./.snap/.pragma.spec.tsx.intrinsic');
  });

  it('renders tree', async () => {


    await expect(<OmniPublic></OmniPublic>).toMatchFileSnapshot('./.snap/.pragma.spec.tsx.json');
  });

  it('encodes tree', async () => {


    await expect(jsxrest(<OmniPublic></OmniPublic>)).toMatchFileSnapshot('./.snap/.pragma.spec.tsx.encode.json');
  });
});
