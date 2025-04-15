import {E} from '#src/disreact/utils/re-exports.ts';
import {SimpleMessage} from '#test/unit/runtime/scenarios/.components/simple-message.tsx';
import {SimpleModal, SimpleModalService, SimpleModalServiceLogger} from '#test/unit/runtime/scenarios/.components/simple-modal.tsx';
import {it} from '@effect/vitest';
import {makeTestRuntime} from 'test/unit/util.ts';

const runtime = makeTestRuntime([SimpleModal, SimpleMessage], false);

it.scoped('when opening', E.fn(function* () {
  const root = yield* runtime.synthesize(SimpleMessage);

  expect(root).toMatchSnapshot();

  const res = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : root,
    type          : 2,
    data          : {
      custom_id     : 'OpenModal',
      component_type: 2,
    },
  });

  expect(res).toMatchSnapshot();
  expect(runtime.createUpdate).not.toBeCalled();
  expect(runtime.deferUpdate).toBeCalled();
  expect(runtime.createModal).toBeCalled();
}));

it.scoped('when submitting', E.fn(function* () {
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
    data          : {
      ...modal,
      custom_id : 'SimpleModal',
      components: [
        ...modal.components.with(0, {
          ...modal.components.at(0),
          components: [{
            ...modal.components.at(0).components.at(0),
            value: 'SubmittedText',
          }],
        }),
      ],
    },
  }).pipe(E.provide(SimpleModalService.Default));

  expect(SimpleModalServiceLogger.mock.calls).toMatchSnapshot();
  expect(res).toMatchSnapshot();
}));
