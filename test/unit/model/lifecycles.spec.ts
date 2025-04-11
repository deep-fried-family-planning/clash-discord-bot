import {encodeRoot} from '#src/disreact/codec/Codec.ts';
import { Elem } from '#src/disreact/model/entity/elem';
import {Trigger} from '#src/disreact/model/entity/trigger';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {describe, expect} from '@effect/vitest';
import {pipe, Record} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {expectJSON, it} from 'test/unit/components/TestRegistry.tsx';



it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Registry;
  const root = yield* registry.checkout(TestMessage);

  yield* Lifecycles.initialize(root);

  const event = Trigger.make('actions:2:button:0', {});

  expect(Record.map(root.fibrils, (v) => v.stack)).toMatchInlineSnapshot(`
    {
      "TestMessage": [
        {
          "s": 0,
        },
      ],
      "TestMessage:message:0:Header:0": [],
    }
  `);

  expect(JSON.stringify(encodeRoot(root), null, 2)).toMatchSnapshot();

  yield* Lifecycles.handleEvent(root, event);
  yield* Lifecycles.rerender(root);

  expect(Record.map(root.fibrils, (v) => v.stack)).toMatchInlineSnapshot(`
    {
      "TestMessage": [
        {
          "s": 1,
        },
      ],
      "TestMessage:message:0:Header:0": [],
    }
  `);

  expect(JSON.stringify(encodeRoot(root), null, 2)).toMatchSnapshot();
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Registry;
    const root = yield* registry.checkout(TestMessage);
    yield* Lifecycles.initialize(root);
    yield* Lifecycles.rerender(root);

    const event = Trigger.make('buttons:1:button:0', {});

    yield* pipe(
      Lifecycles.handleEvent(root, event),
      E.catchAll((err) => {
        expect(err).toMatchInlineSnapshot(`[Error: Event not handled]`);
        return E.void;
      }),
    );
  }));
});

it.effect('when rendering an initial tree', E.fn(function* () {
  const registry = yield* Registry;
  const root = yield* registry.checkout(TestMessage);
  yield* Lifecycles.initialize(root);
  expect(JSON.stringify(encodeRoot(root), null, 2)).toMatchSnapshot();
}));

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 10000});
  const registry = yield* Registry;

  for (let i = 0; i < runs.length; i++) {
    const root = yield* registry.checkout(TestMessage);

    yield* Lifecycles.initialize(root);

    yield* Lifecycles.hydrate(root);

    const event = Trigger.make('actions:2:button:0', {});

    yield* Lifecycles.handleEvent(root, event);
    yield* Lifecycles.rerender(root);

    const encoded = encodeRoot(root);
  }
}), {timeout: 10000});
