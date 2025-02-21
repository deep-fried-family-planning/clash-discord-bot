import {encodeDialogDsx, encodeMessageDsx} from '#src/disreact/codec/dsx-encoder.ts';
import {jsx} from '#src/disreact/jsx-runtime.ts';
import {HookDispatch} from '#src/disreact/model/HookDispatch.ts';
import {cloneTree, initialRender} from '#src/disreact/model/lifecycle.ts';
import {E} from '#src/internal/pure/effect.ts';
import {expect, it} from '@effect/vitest';
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

  it.effect('when encoding a message', E.fn(function* () {
    given.component = jsx(TestMessage, {});
    const rendered  = yield* initialRender(given.component);
    console.log(tojson(rendered));
    const clone  = cloneTree(rendered);
    const actual = encodeMessageDsx(clone);

    yield* E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/message.json')});
  }));

  it.effect('when encoding a dialog', E.fn(function* () {
    given.component = jsx(TestDialog, {});
    const rendered  = yield* initialRender(given.component);
    const clone     = cloneTree(rendered);
    const actual    = encodeDialogDsx(clone);

    yield* E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/dialog.json')});
  }));
});
