import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {usePage} from '#src/disreact/index.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import { Runtime } from '#src/disreact/runtime/runtime';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {Logger} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import TestMessageJSON from 'test/unit/runtime/.runtime/TestMessage.json';
import MessageCloseSynthesizeJSON from './MessageClose.synthesize.json';

const CloseButton = () => {
  const page = usePage([]);

  return (
    <secondary
      custom_id={'CloseButton'}
      onclick={() => {
        page.close();
      }}
    />
  );
};

const MessageClose = () => {
  return (
    <message>
      <embed>
        {'Hello World!'}
      </embed>
      <actions>
        <CloseButton/>
      </actions>
    </message>
  );
};

const createUpdate = vi.fn(() => E.void);
const deferEdit = vi.fn(() => E.void);
const deferUpdate = vi.fn(() => E.void);
const dismount = vi.fn(() => E.void);

const layer = Runtime.makeGlobalRuntimeLayer({
  config: {
    token    : 'token',
    ephemeral: [
      <MessageClose/>,
    ],
  },
  dom: L.succeed(
    DisReactDOM,
    DisReactDOM.make({
      createUpdate,
      deferEdit,
      deferUpdate,
      dismount,
    } as any),
  ),
  memory: DokenMemory.Default,
});

const runtime = Runtime.makeRuntime(
  pipe(
    layer,
    L.provideMerge(
      Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
    ),
  ),
);

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* runtime.synthesize(<MessageClose/>);

  yield* E.promise(() => expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./MessageClose.synthesize.json'));
}));

it.effect('when closing', E.fn(function* () {
  const root = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : MessageCloseSynthesizeJSON,
    type          : 2,
    data          : {
      custom_id     : 'CloseButton',
      component_type: 2,
    },
  });

  expect(createUpdate).toBeCalledTimes(0);
  expect(deferEdit).toBeCalledTimes(0);
  expect(deferUpdate).toBeCalledTimes(1);
  expect(dismount).toBeCalledTimes(1);
  expect(root).toEqual(null);
}));
