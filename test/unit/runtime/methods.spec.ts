import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Methods} from '#src/disreact/runtime/methods.ts';
import {Runtime} from '#src/disreact/runtime/runtime';
import {L, pipe} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it, vi} from '@effect/vitest';
import {TestServices} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {testmessage} from 'test/unit/runtime/methods.testdata.ts';
import { Snap } from 'test/unit/scenarios/util.ts';
import { SNAP } from '../scenarios/snapkey';



const createUpdate = vi.fn((...args: any) => E.void);
const deferEdit = vi.fn((...args: any) => E.void);
const deferUpdate = vi.fn((...args: any) => E.void);

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
  const root = yield* Methods.synthesize(TestMessage).pipe(E.provide(layer));

  yield*Snap.JSON(root, SNAP.TEST_MESSAGE);
}));

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Methods.synthesize(TestMessage).pipe(E.provide(layer));

    yield*Snap.JSON(root, SNAP.TEST_MESSAGE);
  }
}));

it.scopedLive('when responding', E.fn(function* () {
  const req1 = {
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : testmessage,
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  };

  const res1 = yield* Methods.respond(req1).pipe(E.provide(Relay.Fresh), E.provide(layer));

  const req2 = {
    message       : res1,
    id            : '1236074574509117491',
    token         : 'respond2',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  };

  yield* Methods.respond(req2).pipe(E.provide(Relay.Fresh), E.provide(layer));

  yield* Snap.JSON(deferEdit.mock.calls[0][1], SNAP.TEST_MESSAGE, '1');
  yield* Snap.JSON(deferEdit.mock.calls[1][1], SNAP.TEST_MESSAGE, '2');
}));

it.scopedLive('when responding (performance)', E.fn(function* () {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    yield* Methods.respond({
      id            : '1236074574509117491',
      token         : 'respond1',
      application_id: 'app',
      user_id       : 'user',
      guild_id      : 'guild',
      message       : testmessage,
      type          : 2,
      data          : {
        custom_id     : 'actions:2:button:0',
        component_type: 2,
      },
    }).pipe(E.provide(Relay.Fresh), E.provide(layer));
  }
}));
