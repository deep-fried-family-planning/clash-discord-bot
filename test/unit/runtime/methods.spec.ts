import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Helpers} from '#src/disreact/runtime/helpers.ts';
import {Methods} from '#src/disreact/runtime/methods.ts';
import {E} from '#src/internal/pure/effect.ts';
import {TestClock} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {it, TestRegistry} from 'test/unit/components/TestRegistry.tsx';
import TestMessageJSON from 'test/unit/runtime/.synthesized/TestMessage.json';
import { Misc } from '#src/disreact/utils/misc.ts';

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* Methods.synthesize(TestMessage);

  yield* E.promise(() =>
    expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
  );
}));

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Methods.synthesize(TestMessage);

    yield* E.promise(() =>
      expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.synthesized/TestMessage.json'),
    );
  }
}));

it.scoped('when responding', E.fn(function* () {
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
  });

  const ixdom = yield* DisReactDOM;
  const root = ixdom.reply.mock.calls[0][2];

  yield* E.promise(() =>
    expect(JSON.stringify(ixdom.reply.mock.calls[0][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessage1.json'),
  );

  yield* Methods.respond({
    message       : ixdom.reply.mock.calls[0][2],
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
    expect(JSON.stringify(ixdom.reply.mock.calls[1][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessage2.json'),
  );
}));

it.live('when responding (performance)', E.fn(
  function* () {
    const runs = Array.from({length: 10000});

    for (let i = 0; i < runs.length; i++) {
      // const initial = yield* Methods.synthesize(TestMessage);

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
      }).pipe(
        E.provide(Relay.Fresh),
      );

      // const ixdom = yield* DisReactDOM;
      // const root = ixdom.reply.mock.calls[0][2];
      //
      // yield* Methods.respond({
      //   message       : ixdom.reply.mock.calls[0][2],
      //   id            : '1299833226612969542',
      //   token         : 'respond2',
      //   application_id: 'app',
      //   user_id       : 'user',
      //   guild_id      : 'guild',
      //   type          : 2,
      //   data          : {
      //     custom_id     : 'actions:2:button:0',
      //     component_type: 2,
      //   },
      // }).pipe(
      //   E.provide(Relay.Fresh),
      // );

      // yield* E.promise(() =>
      //   expect(JSON.stringify(ixdom.reply.mock.calls[1][2], null, 2)).toMatchFileSnapshot('./.responded/TestMessage2.json'),
      // );
    }
  },
  E.scoped,
  E.provide(TestRegistry),
  E.tap(() => Misc.displayMetrics),
), {timeout: 20000});
