import {RootRegistry} from '#src/disreact/model/RootRegistry.ts';
import {synthesize} from '#src/disreact/runtime/synthesize.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it} from '@effect/vitest';
import {pipe} from 'effect';
import {TestDialog} from 'test/unit/disreact/model/.components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/model/.components/test-message.tsx';



const staticGraph = RootRegistry.singleton({
  persistent: [
    TestMessage,
    TestDialog,
  ],
  ephemeral: [],
  dialog   : [],
});



describe('DisReact.synthesize', () => {
  it.live('synthesizes interaction root', E.fn(function* () {
    const actual = yield* synthesize(TestMessage).pipe(
      E.provide(pipe(
        staticGraph,
      )),
    );

    yield* E.promise(async () => await expect(JSON.stringify(actual, null, 2)).toMatchFileSnapshot('./.snap/synthesize.json'));
  }));
});
