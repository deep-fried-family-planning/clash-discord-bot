import {Codec} from '#src/disreact/codec/Codec.ts';
import {Trigger} from '#src/disreact/model/entity/trigger';
import {Lifecycle} from '#src/disreact/model/lifecycle.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {flow, S} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Record} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {it} from 'test/unit/components/TestRegistry.tsx';
import { LifecycleIO } from '#src/disreact/model/lifecycle-io';

const json = (input: any) => JSON.stringify(input, null, 2);
const snap = (root: Rehydrant) => json(root);
const toStacks = (root: Rehydrant) => Record.map(root.fibrils, (v) => v.stack);
const hash = flow(Rehydrant.dehydrate, S.encodeSync(Rehydrant.Hydrator));

it.effect('when initial rendering', E.fn(function* () {
  const root = yield* Registry.checkout(TestMessage);
  yield* Lifecycle.initialize(root);
  const encoding = yield* LifecycleIO.encode(root.elem);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Registry;
  const root = yield* registry.checkout(TestMessage);

  yield* Lifecycle.initialize(root);

  expect(toStacks(root)).toMatchSnapshot('initial stacks');
  expect(hash(root)).toMatchSnapshot('initial hash');
  const initial = yield* LifecycleIO.encode(root.elem);
  expect(snap(initial?.data)).toMatchSnapshot('initial encoded');

  const event = Trigger.make('actions:2:button:0', {});
  yield* Lifecycle.handleEvent(root, event);
  yield* Lifecycle.rerender(root);

  expect(toStacks(root)).toMatchSnapshot('rerendered stacks');
  expect(hash(root)).toMatchSnapshot('rerendered hash');
  const rerendered = yield* LifecycleIO.encode(root.elem);
  expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Registry;
    const root = yield* registry.checkout(TestMessage);
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.rerender(root);

    const event = Trigger.make('buttons:1:button:0', {});

    expect(() => E.runSync(Lifecycle.handleEvent(root, event) as any)).toThrowErrorMatchingSnapshot();
  }));
});

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 10000});
  // const registry = yield* Registry;

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Registry.checkout(TestMessage);
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.hydrate(root);

    const event = Trigger.make('actions:2:button:0', {});

    yield* Lifecycle.handleEvent(root, event);
    yield* Lifecycle.rerender(root);

    yield* LifecycleIO.encode(root.elem);
  }
}), {timeout: 10000});
