import {usePage} from '#src/disreact/index.ts';
import {E} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {makeTestRuntime} from 'test/unit/util.ts';



const CloseButton = () => {
  const page = usePage([]);
  return (<secondary
    custom_id={'CloseButton'}
    onclick={() => page.close()}
  />);
};

const MessageClose = () => <message>
  <embed>
    {'Hello World!'}
  </embed>
  <actions>
    <CloseButton/>
  </actions>
</message>;

const runtime = makeTestRuntime([MessageClose], false);

it.scoped('when closing', E.fn(function* () {
  const root = yield* runtime.synthesize(MessageClose);

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
      custom_id     : 'CloseButton',
      component_type: 2,
    },
  });

  expect(res).toMatchSnapshot();
  expect(runtime.createUpdate).not.toBeCalled();
  expect(runtime.deferEdit).not.toBeCalled();
  expect(runtime.deferUpdate).toBeCalled();
  expect(runtime.dismount).toBeCalled();
}));
