import { Snowflake } from '#src/disreact/adaptor/codec/dapi/snowflake.ts';
import {SimpleMessage} from '#unit/components/simple-message.tsx';
import {SimpleModal, SimpleModalService, SimpleModalServiceLogger} from '#unit/components/simple-modal.tsx';
import {makeTestRuntime} from '#unit/util.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as TestClock from 'effect/TestClock';

const runtime = makeTestRuntime([SimpleModal, SimpleMessage], false);

it.effect('when opening', E.fn(function* () {
  const root = yield* runtime.synthesize(SimpleMessage, {}, {});

  expect(root).toMatchSnapshot();

  const resFork = yield* runtime.respond({
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
  }).pipe(E.tapErrorCause(E.logFatal));

  const res = resFork;

  expect(res).toMatchSnapshot();
  expect(runtime.deferEdit).not.toBeCalled();
  expect(runtime.createModal).toBeCalled();
}));

it.effect('when submitting', E.fn(
  function* () {
    yield* Snowflake.toDateTime('1236074574509117491').pipe(
      TestClock.setTime,
    );

    const message = yield* runtime.synthesize(SimpleMessage, {});
    const modal = yield* runtime.synthesize(SimpleModal, {});

    const res = yield* runtime.respond({
      id            : '1236074574509117491',
      token         : 'respond1',
      application_id: 'app',
      user_id       : 'user',
      guild_id      : 'guild',
      message       : message,
      type          : 5,
      data          : modal,
    }).pipe();

    expect(SimpleModalServiceLogger.mock.calls).toMatchSnapshot();
    expect(res).toMatchSnapshot();
  },
  E.provide(SimpleModalService.Default),
));
