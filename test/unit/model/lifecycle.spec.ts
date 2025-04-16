import {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Lifecycle} from '#src/disreact/model/lifecycle.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Rehydrant} from '#src/disreact/model/rehydrant.ts';
import {flow, S} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {MessageEffect} from '#test/unit/components/message-effect.tsx';
import {MessageAsync} from '#test/unit/components/message-async.tsx';
import {MessageSync} from '#test/unit/components/message-sync.tsx';
import {Record} from 'effect';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import {it} from '#test/unit/components/TestRegistry.tsx';
import { FC } from '#src/disreact/model/meta/fc.ts';

const json = (input: any) => JSON.stringify(input, null, 2);
const snap = (root: Rehydrant) => json(root);
const toStacks = (root: Rehydrant) => Record.map(root.fibrils, (v) => v.stack);
const hash = flow(Rehydrant.dehydrate, S.encodeSync(Rehydrant.Hydrator));

it.effect('when rendering sync', E.fn(function* () {
  const root = yield* Registry.checkout(MessageSync);
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageSync));
}));

it.effect('when rendering async', E.fn(function* () {
  const root = yield* Registry.checkout(MessageAsync);
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageAsync));
}));

it.effect('when rendering effect', E.fn(function* () {
  const root = yield* Registry.checkout(MessageEffect);
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageEffect));
}));

it.effect('when initial rendering', E.fn(function* () {
  const root = yield* Registry.checkout(TestMessage);
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Registry;
  const root = yield* registry.checkout(TestMessage);

  yield* Lifecycle.initialize(root);

  expect(toStacks(root)).toMatchSnapshot('initial stacks');
  expect(hash(root)).toMatchSnapshot('initial hash');
  const initial = yield* Lifecycle.encode(root);
  expect(snap(initial?.data)).toMatchSnapshot('initial encoded');

  const event = Trigger.make('actions:2:button:0', {});
  yield* Lifecycle.invoke(root, event);
  yield* Lifecycle.rerender(root);

  expect(toStacks(root)).toMatchSnapshot('rerendered stacks');
  expect(hash(root)).toMatchSnapshot('rerendered hash');
  const rerendered = yield* Lifecycle.encode(root);
  expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Registry;
    const root = yield* registry.checkout(TestMessage);
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.rerender(root);

    const event = Trigger.make('buttons:1:button:0', {});

    expect(() => E.runSync(Lifecycle.invoke(root, event) as any)).toThrowErrorMatchingSnapshot();
  }));
});

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Registry.checkout(TestMessage);
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.rehydrate(root);

    const event = Trigger.make('actions:2:button:0', {});

    yield* Lifecycle.invoke(root, event);
    yield* Lifecycle.rerender(root);

    yield* Lifecycle.encode(root);
  }
}), {timeout: 10000});
