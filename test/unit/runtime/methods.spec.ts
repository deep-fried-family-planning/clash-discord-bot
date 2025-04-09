import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Methods} from '#src/disreact/runtime/methods.ts';
import { Runtime } from '#src/disreact/runtime/runtime';
import {L} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {TestClock} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import TestMessageJSON from 'test/unit/runtime/.synthesized/TestMessage.json';
import {it} from '@effect/vitest';

const createUpdate = vi.fn(() => E.void);
const deferEdit = vi.fn(() => E.void);
const deferUpdate = vi.fn(() => E.void);

const layer = Runtime.makeGlobalRuntimeLayer({
  config: {
    token    : '',
    ephemeral: [
      TestMessage,
    ],
  },
  dom: L.succeed(
    DisReactDOM,
    DisReactDOM.make({
      createUpdate,
      deferEdit,
      deferUpdate,
    } as any),
  ),
});

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

it.effect('when responding', E.fn(function* () {
  yield* TestClock.setTime(0);

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
  }).pipe(E.scoped, E.provide(Relay.Fresh));

  yield* E.promise(() =>
    expect(JSON.stringify(createUpdate.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.responded/TestMessage1.json'),
  );

  yield* Methods.respond({
    message       : createUpdate.mock.calls[0][1],
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
  }).pipe(E.scoped, E.provide([Relay.Fresh]));

  yield* E.promise(() =>
    expect(JSON.stringify(createUpdate.mock.calls[1][1], null, 2)).toMatchFileSnapshot('./.responded/TestMessage2.json'),
  );
}, E.provide(layer)));

it.effect('when responding (performance)', E.fn(
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
      }).pipe(E.scoped, E.provide(Relay.Fresh));
    }
  }, E.provide(layer),
), {timeout: 20000});
