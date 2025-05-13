import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import * as L from 'effect/Layer';
import * as Record from 'effect/Record';
import {CloseMessage} from '#test/unit/components/close-message.tsx';
import {makeTestRuntime} from '#test/unit/util.ts';
import {it} from '@effect/vitest';

const runtime = makeTestRuntime([CloseMessage], false);

it.effect('when closing', E.fn(function* () {
  const root = yield* runtime.synthesize(CloseMessage);

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
  expect(runtime.deferEdit).not.toBeCalled();
  expect(runtime.dismount).toBeCalled();
}));
