import {jsx} from '#src/disreact/interface/jsx-runtime.ts';
import {dsxEncode, encodeDialogDsx, encodeMessageDsx} from '#src/disreact/codec/dsx-encoder.ts';
import {HookDispatch} from '#src/disreact/hooks/HookDispatch.ts';
import {cloneTree, initialRender} from '#src/disreact/dsx/lifecycle.ts';
import {TestDialog} from 'test/unit/disreact/internal/dsx/.components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';


const tojson = (actual: any) => JSON.stringify(actual, null, 2);


describe('dsx-encoder', () => {
  let given: any;

  beforeEach(() => {
    given = {};
    HookDispatch.__mallocnull();
  });

  afterEach(HookDispatch.__free);

  it('when encoding a message', async () => {
    given.component = jsx(TestMessage, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = dsxEncode(clone);

    await expect(tojson(actual)).toMatchFileSnapshot('./.snap/message.json');
  });

  it('when encoding a dialog', async () => {
    given.component = jsx(TestDialog, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = dsxEncode(clone);

    await expect(tojson(actual)).toMatchFileSnapshot('./.snap/dialog.json');
  });
});
