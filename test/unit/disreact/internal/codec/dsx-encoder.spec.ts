/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument */
import {jsx} from '#src/disreact/interface/jsx-runtime.ts';
import {encodeDialogDsx, encodeMessageDsx} from '#src/disreact/internal/codec/dsx-encoder.ts';
import {__free, __mallocnull} from '#src/disreact/internal/dsx/globals.ts';
import {cloneTree, initialRender} from '#src/disreact/internal/dsx/lifecycle.ts';
import {TestDialog} from 'test/unit/disreact/internal/dsx/.components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';


const tojson = (actual: any) => JSON.stringify(actual, null, 2);


describe('dsx-encoder', () => {
  let given: any;

  beforeEach(() => {
    given = {};
    __mallocnull();
  });

  afterEach(__free);

  it('when encoding a message', async () => {
    given.component = jsx(TestMessage, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = encodeMessageDsx(clone);

    await expect(tojson(actual)).toMatchFileSnapshot('./.snap/message.json');
  });

  it('when encoding a dialog', async () => {
    given.component = jsx(TestDialog, {});
    const rendered  = initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = encodeDialogDsx(clone);

    await expect(tojson(actual)).toMatchFileSnapshot('./.snap/dialog.json');
  });
});
