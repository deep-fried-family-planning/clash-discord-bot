import {InteractionDOM} from '#src/disreact/interface/InteractionDOM.ts';
import {DokenCache} from '#src/disreact/interface/DokenCache.ts';
import {OldRoot} from '#src/disreact/model/RootRegistry.ts';
import {interact} from '#src/disreact/runtime/interact.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {it} from '@effect/vitest';
import {pipe} from 'effect';
import {TestDialog} from 'test/unit/disreact/components/test-dialog.tsx';
import {TestMessage} from 'test/unit/disreact/components/test-message.tsx';
import synthesized from '././.snap/synthesize.json';



const staticGraph = OldRoot.singleton({
  persistent: [
    TestMessage,
    TestDialog,
  ],
  ephemeral: [],
  dialog   : [],
});

const mockDiscord = L.scoped(InteractionDOM, E.succeed({
  discard : vi.fn(),
  defer   : vi.fn(),
  create  : vi.fn(),
  reply   : vi.fn(),
  update  : vi.fn(),
  dismount: vi.fn(),
}));



describe('DisReact.interact', () => {
  it.effect('when processing interaction', E.fn(function* () {
    const discordDOM = yield* InteractionDOM;

    yield* pipe(
      interact({
        id   : 'testixid',
        token: 'testtoken',
        type : 3,
        data : {
          custom_id     : 'actions:2:button:0',
          component_type: 2,
        },
        message: synthesized,
      }),
      E.awaitAllChildren,
      E.provide(pipe(
        staticGraph,
        L.provideMerge(DokenCache.localLayer({})),
      )),
    );

    expect(discordDOM.defer).toHaveBeenCalledTimes(1);
    expect(discordDOM.reply).toHaveBeenCalledTimes(1);

    yield* E.promise(async () => await expect(JSON.stringify(discordDOM.defer.mock.calls[0][0], null, 2)).toMatchFileSnapshot('./.snap/defer-doken.json'));
    yield* E.promise(async () => await expect(JSON.stringify(discordDOM.reply.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.snap/interact-doken.json'));
    yield* E.promise(async () => await expect(JSON.stringify(discordDOM.reply.mock.calls[0][2], null, 2)).toMatchFileSnapshot('./.snap/interact-message.json'));
  }, E.provide(mockDiscord)));
});
