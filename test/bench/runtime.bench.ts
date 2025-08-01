import * as Methods from '#disreact/core/a/methods.ts';
import {TestMessage} from '#unit/components/test-message.tsx';
import {testmessage} from '#unit/adaptor/methods.testdata.ts';
import {makeTestRuntime} from '#unit/util.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {describe, bench} from 'vitest';

const runtime = makeTestRuntime([TestMessage], false);

describe.shuffle('runtime', {}, () => {
  bench('synthesize', async () => {
    await pipe(
      runtime.synthesize(TestMessage, {}, {}),
      E.runPromise,
    );
  }, {
    time      : 1000,
    warmupTime: 500,
  });

  bench('respond', async () => {
    await pipe(
      runtime.respond({
        id            : '13781533544247460140',
        token         : 'respond1',
        application_id: 'app',
        user_id       : 'user',
        guild_id      : 'guild',
        message       : testmessage,
        type          : 3,
        data          : {
          custom_id     : 'actions:0:button:0',
          component_type: 2,
        },
      }),
      E.runPromise,
    );
  }, {
    time      : 1000,
    warmupTime: 500,
  });
});

// const runtimeRoot = await E.runPromise(runtime.synthesize(TestMessage, {}, {}));
