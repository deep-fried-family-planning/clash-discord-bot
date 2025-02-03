import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {makeNullHookStates, setNullPointer} from '#src/disreact/internal/globals.ts';
import {cloneTree, initialRenderTree} from '#src/disreact/internal/lifecycle.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';



describe('lifecycle', () => {
  it('cloneTree', () => {
    const initial = jsx(OmniPublic, {});
    const clone   = cloneTree(initial);

    expect(clone).toEqual(initial);
  });

  it('initialRenderTree', () => {
    setNullPointer();
    makeNullHookStates();

    const initial      = jsx(OmniPublic, {});
    const clone        = cloneTree(initial);
    const render       = initialRenderTree(clone);
    const secondRender = initialRenderTree(clone);

    expect(JSON.stringify(render, null, 2)).toEqual(JSON.stringify(secondRender, null, 2));
  });
});
