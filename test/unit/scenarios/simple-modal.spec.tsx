import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import * as L from 'effect/Layer';
import * as Record from 'effect/Record';
import {SimpleMessage} from '#test/unit/components/simple-message.tsx';
import {SimpleModal, SimpleModalService, SimpleModalServiceLogger} from '#test/unit/components/simple-modal.tsx';
import {makeTestRuntime} from '#test/unit/util.ts';
import {it} from '@effect/vitest';

const runtime = makeTestRuntime([SimpleModal, SimpleMessage], false);

it.effect('when opening', E.fn(function* () {
  const root = yield* runtime.synthesize(SimpleMessage);

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
      custom_id     : 'OpenModal',
      component_type: 2,
    },
  });

  expect(res).toMatchSnapshot();
  expect(runtime.createUpdate).not.toBeCalled();
  expect(runtime.createModal).toBeCalled();
}));

it.live('when submitting', E.fn(function* () {
  const message = yield* runtime.synthesize(SimpleMessage);
  const modal = yield* runtime.synthesize(SimpleModal);

  const res = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : message,
    type          : 5,
    data          : modal,
  }).pipe(E.provide(SimpleModalService.Default));

  expect(SimpleModalServiceLogger.mock.calls).toMatchSnapshot();
  expect(res).toMatchSnapshot();
}));
