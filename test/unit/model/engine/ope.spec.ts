// import {Rehydrator} from '#src/disreact/adaptor/adaptor/Rehydrator.ts';
import {MessageAsync} from '#unit/components/message-async.tsx';
import {MessageEffect} from '#unit/components/message-effect.tsx';
import {MessageSync} from '#unit/components/message-sync.tsx';
import {TestMessage} from '#unit/components/test-message.tsx';
// import {it} from '#unit/components/TestRegistry.tsx';
import * as E from 'effect/Effect';
import * as Envelope from '#disreact/internal/Envelope.ts';
import * as Hydrant from '#disreact/model/runtime/Hydrant.ts';
import * as Entrypoint from '#disreact/model/runtime/Entrypoint.ts';
import * as lifecycle from '#disreact/model/lifecycles.ts';
import {it} from '@effect/vitest';

Entrypoint.register('MessageSync', MessageSync);
Entrypoint.register('MessageAsync', MessageAsync);
Entrypoint.register('MessageEffect', MessageEffect);
Entrypoint.register('TestMessage', TestMessage);


it.effect('when rendering sync', E.fn(function* () {
  const hydrant = yield* Hydrant.fromRegistry(MessageSync, {});
  const root = yield* Envelope.make(hydrant, {});
  const init = yield* lifecycle.initializeCycle(root);
  const rerendered = yield* lifecycle.rerenderCycle(init);
  const encoded = yield* lifecycle.encodeCycle(rerendered);

  expect(encoded.payload).toMatchInlineSnapshot(`
    {
      "components": [
        {
          "components": [
            {
              "label": "ButtonSync",
              "style": 1,
              "type": 2,
            },
            {
              "label": "ButtonAsync",
              "style": 1,
              "type": 2,
            },
            {
              "label": "ButtonEffect",
              "style": 1,
              "type": 2,
            },
          ],
          "type": 1,
        },
      ],
      "embeds": [
        {
          "description": "MessageSync",
        },
      ],
    }
  `);
}));

// it.effect('when rendering async', E.fn(function* () {
//   const root = yield* Rehydrator.checkout(MessageAsync, {});
//   yield* Lifecycle.init__(root);
//   const encoding = yield* Lifecycle.encode(root);
//   expect(snap(encoding?.data)).toMatchSnapshot();
// }));
//
// it.effect('when rendering effect', E.fn(function* () {
//   const root = yield* Rehydrator.checkout(MessageEffect, {});
//   yield* Lifecycle.init__(root);
//   const encoding = yield* Lifecycle.encode(root);
//   expect(snap(encoding?.data)).toMatchSnapshot();
// }));
//
// it.effect('when initial rendering', E.fn(function* () {
//   const root = yield* Rehydrator.checkout(TestMessage, {});
//   yield* Lifecycle.init__(root);
//   const encoding = yield* Lifecycle.encode(root);
//   expect(snap(encoding?.data)).toMatchSnapshot();
// }));
//
// it.effect('when dispatching an event', E.fn(function* () {
//   const registry = yield* Rehydrator;
//   const root = yield* registry.checkout(TestMessage, {});
//
//   yield* Lifecycle.init__(root);
//
//   const initial = yield* Lifecycle.encode(root);
//   expect(snap(initial?.data)).toMatchSnapshot('initial encoded');
//
//   const event = Element.event('actions:0:button:0', {});
//   yield* Lifecycle.invoke2(root, event);
//   yield* Lifecycle.rerenders(root);
//
//   expect(hydrator(root)).toMatchSnapshot('rerendered stacks');
//   expect(hash(root)).toMatchSnapshot('rerendered hash');
//   const rerendered = yield* Lifecycle.encode(root);
//   expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
// }));
//
// describe('given event.id does not match any node.id', () => {
//   it.effect('when dispatching an event', E.fn(function* () {
//     const registry = yield* Rehydrator;
//     const root = yield* registry.checkout(TestMessage, {});
//     yield* Lifecycle.init__(root);
//     yield* Lifecycle.rerenders(root);
//
//     const event = Element.event('buttons:1:button:0', {});
//
//     expect(() => E.runSync(Lifecycle.invoke2(root, event) as any)).toThrowErrorMatchingSnapshot();
//   }));
// });
//
// it.effect(`when hydrating an empty root (performance)`, E.fnUntraced(function* () {
//   const runs = Array.from({length: 10000});
//
//   for (let i = 0; i < runs.length; i++) {
//     const root = yield* Rehydrator.checkout(TestMessage, {}, {});
//     yield* Lifecycle.init__(root);
//     yield* Lifecycle.rehydrate__(root);
//
//     const event = Element.event('actions:0:button:0', {});
//
//     yield* Lifecycle.invoke2(root, event);
//     yield* Lifecycle.rerenders(root);
//
//     yield* Lifecycle.encode(root);
//   }
// }), {timeout: 10000});
