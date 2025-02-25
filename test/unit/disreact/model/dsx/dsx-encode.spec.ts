import {jsx} from '#src/disreact/jsx-runtime.ts';
import {encodeDialogDsx, encodeMessageDsx} from '#src/disreact/model/dsx/element-encode.ts';
import * as Globals from '#src/disreact/model/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it} from '@effect/vitest';
import {TestDialog} from 'test/unit/disreact/model/.components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/model/.components/test-message.tsx';



const tojson = (actual: any) => JSON.stringify(actual, null, 2);



describe('dsx-encoder', () => {
  let given: any;

  beforeEach(() => {
    given      = {};
    const Null = Globals.nullifyPointer();
    Globals.mountRoot(Null);
  });

  afterEach(() => {
    Globals.dismountRoot();
    Globals.unsetPointer();
  });

  it.effect('when encoding a message', E.fn(function* () {
    given.component = jsx(TestMessage, {});
    const rendered  = yield* Lifecycles.initialRender(given.component);
    const clone     = Lifecycles.cloneTree(rendered);
    const actual    = encodeMessageDsx(clone);

    yield* E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/message.json')});
  }));

  it.effect('when encoding a dialog', E.fn(function* () {
    given.component = jsx(TestDialog, {});
    const rendered  = yield* Lifecycles.initialRender(given.component);
    const clone     = Lifecycles.cloneTree(rendered);
    const actual    = encodeDialogDsx(clone);

    yield* E.promise(async () => {await expect(tojson(actual)).toMatchFileSnapshot('./.snap/dialog.json')});
  }));
});
