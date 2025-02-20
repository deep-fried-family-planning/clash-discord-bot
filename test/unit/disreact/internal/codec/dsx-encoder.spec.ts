import {encodeDialogDsx, encodeMessageDsx, encodeRoot} from '#src/disreact/codec/dsx-encoder.ts';
import {cloneTree, initialRender} from '#src/disreact/dsx/lifecycle.ts';
import {HookDispatch} from '#src/disreact/hooks/HookDispatch.ts';
import {jsx} from '#src/disreact/interface/jsx-runtime.ts';
import {E} from '#src/internal/pure/effect.ts';
import {expect, it} from '@effect/vitest';
import {TestDialog} from 'test/unit/disreact/internal/dsx/.components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/internal/dsx/.components/test-message.tsx';

const tojson = (actual: any) => JSON.stringify(actual, null, 2);


describe('dsx-encoder', () => {
  let given: any;

  const output = {};

  beforeEach(() => {
    given = {};
    HookDispatch.__mallocnull();
  });

  afterEach(HookDispatch.__free);

  it.live('when encoding a message', E.fn(function* () {
    given.component = jsx(TestMessage, {});
    const rendered  = yield * initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = encodeMessageDsx(clone);

    yield* E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/message.json')});
  }));

  it('when encoding a dialog', E.fn(function* ()  {
    given.component = jsx(TestDialog, {});
    const rendered  = yield * initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = encodeDialogDsx(clone);

    yield * E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/dialog.json')});
  }));
});
