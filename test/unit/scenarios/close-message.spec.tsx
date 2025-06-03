import {CloseMessage} from '#test/unit/components/close-message.tsx';
import {makeTestRuntime} from '#test/unit/util.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';

const runtime = makeTestRuntime([CloseMessage], false);

it.effect('when closing', E.fn(function* () {
  const root = yield* runtime.synthesize(CloseMessage, {}, {});

  expect(root).toMatchSnapshot();

  const res = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : root,
    type          : 3,
    data          : {
      custom_id     : 'CloseButton',
      component_type: 2,
    },
  });

  expect(res).toMatchSnapshot();
  expect(runtime.createUpdate).not.toBeCalled();
  expect(runtime.createSource).not.toBeCalled();
  expect(runtime.createModal).not.toBeCalled();
  expect(runtime.deferSource).not.toBeCalled();
  expect(runtime.deferEdit).not.toBeCalled();
  expect(runtime.discard).not.toBeCalled();
  expect(runtime.deferUpdate).toBeCalled();
  expect(runtime.dismount).toBeCalled();
}));
