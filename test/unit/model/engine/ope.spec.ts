import {MessageAsync} from '#unit/components/message-async.tsx';
import {MessageEffect} from '#unit/components/message-effect.tsx';
import {MessageSync} from '#unit/components/message-sync.tsx';
import {TestMessage} from '#unit/components/test-message.tsx';
import * as Effect from 'effect/Effect';
import * as Envelope from '#disreact/engine/entity/Envelope.ts';
import * as Hydrant from '#disreact/engine/entity/Hydrant.ts';
import * as Entrypoint from '#disreact/engine/runtime/Entrypoint.ts';
import * as lifecycle from '#disreact/engine/lifecycles.ts';
import {it} from '@effect/vitest';

Entrypoint.register('MessageSync', MessageSync);
Entrypoint.register('MessageAsync', MessageAsync);
Entrypoint.register('MessageEffect', MessageEffect);
Entrypoint.register('TestMessage', TestMessage);

const testInitialize = Effect.fn(function* (fc: any, props: any) {
  const hydrant = yield* Hydrant.fromRegistry(fc, props);
  const root = yield* Envelope.make(hydrant, {});
  const init = yield* lifecycle.initializeCycle(root);
  const rerendered = yield* lifecycle.rerenderCycle(init);
  const encoded = yield* lifecycle.encodeCycle(rerendered);
  return encoded;
});

it.effect('when rendering sync', Effect.fn(function* () {
  const encoded = yield* testInitialize(MessageSync, {});
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

it.effect('when rendering syncs', Effect.fn(function* () {
  let i = 10000;

  while (i) {
    i--;
    yield* testInitialize(MessageSync, {});
  }
}));

it.effect('when rendering async', Effect.fn(function* () {
  const encoded = yield* testInitialize(MessageAsync, {});
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
          "description": "MessageAsync",
        },
      ],
      "flags": 64,
    }
  `);
}));

it.effect('when rendering asyncs', Effect.fn(function* () {
  let i = 10000;

  while (i) {
    i--;
    yield* testInitialize(MessageAsync, {});
  }
}));

it.effect('when rendering effect', Effect.fn(function* () {
  const encoded = yield* testInitialize(MessageEffect, {});
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
          "description": "EphemeralEffect",
        },
      ],
      "flags": 64,
    }
  `);
}));

it.effect('when rendering effects', Effect.fn(function* () {
  let i = 10000;

  while (i) {
    i--;
    yield* testInitialize(MessageEffect, {});
  }
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
