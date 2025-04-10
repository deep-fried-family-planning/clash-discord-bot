import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Methods} from '#src/disreact/runtime/methods.ts';
import {Runtime} from '#src/disreact/runtime/runtime';
import {L, pipe} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it, vi} from '@effect/vitest';
import {TestServices} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import TestMessageJSON from 'test/unit/runtime/.synthesized/TestMessage.json';

const createUpdate = vi.fn(() => E.void);
const deferEdit = vi.fn(() => E.void);
const deferUpdate = vi.fn(() => E.void);

const layer = pipe(
  L.effectContext(E.succeed(TestServices.liveServices)),
  L.provideMerge(
    Runtime.makeGlobalRuntimeLayer({
      config: {
        token  : '',
        sources: [
          TestMessage,
        ],
      },
      dom: L.succeed(DisReactDOM, DisReactDOM.make({
        createUpdate,
        deferEdit,
        deferUpdate,
        discard: vi.fn(() => E.void),
      } as any)),
    }),
  ),
);

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* Methods.synthesize(TestMessage);

  yield* E.promise(() =>
    expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
  );
}, E.provide(layer)));

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Methods.synthesize(TestMessage);

    yield* E.promise(() =>
      expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
    );
  }
}, E.provide(layer)));

it.scopedLive('when responding', E.fn(function* () {
  yield* Methods.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : TestMessageJSON,
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  }).pipe(E.provide(Relay.Fresh));

  yield* E.promise(() =>
    expect(JSON.stringify(deferEdit.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.responded/TestMessage1.json'),
  );

  yield* Methods.respond({
    message       : deferEdit.mock.calls[0][1],
    id            : '1299833226612969542',
    token         : 'respond2',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  }).pipe(E.provide(Relay.Fresh));

  yield* E.promise(() =>
    expect(JSON.stringify(deferEdit.mock.calls[1][1], null, 2)).toMatchFileSnapshot('./.responded/TestMessage2.json'),
  );
}, E.provide(layer)));

it.scopedLive('when responding (performance)', E.fn(
  function* () {
    const runs = Array.from({length: 10000});

    for (let i = 0; i < runs.length; i++) {
      yield* Methods.respond({
        id            : '1236074574509117491',
        token         : 'respond1',
        application_id: 'app',
        user_id       : 'user',
        guild_id      : 'guild',
        message       : TestMessageJSON,
        type          : 2,
        data          : {
          custom_id     : 'actions:2:button:0',
          component_type: 2,
        },
      }).pipe(E.provide(Relay.Fresh));
    }
  }, E.provide(layer),
), {timeout: 20000});
