import * as El from '#src/disreact/model/entity/el.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as Lifecycle from '#src/disreact/model/lifecycle.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import * as Declarations from '#src/disreact/model/schema/declarations.ts';
import {MessageAsync} from '#test/unit/components/message-async.tsx';
import {MessageEffect} from '#test/unit/components/message-effect.tsx';
import {MessageSync} from '#test/unit/components/message-sync.tsx';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import {it} from '#test/unit/components/TestRegistry.tsx';
import * as E from 'effect/Effect';
import {flow} from 'effect/Function';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

const json = (input: any) => JSON.stringify(input, null, 2);
const snap = (root: Rehydrant.Rehydrant) => json(root);
const hydrator = (root: Rehydrant.Rehydrant) => Record.map(root.poly, (v) => v.stack);
const hash = flow(Rehydrant.hydrator, S.encodeSync(Declarations.HydratorTransform));

it.effect('when rendering sync', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageSync, {});
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.name(MessageSync));
}));

it.effect('when rendering async', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageAsync, {});
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.name(MessageAsync));
}));

it.effect('when rendering effect', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageEffect, {});
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.name(MessageEffect));
}));

it.effect('when initial rendering', E.fn(function* () {
  const root = yield* Rehydrator.checkout(TestMessage, {});
  yield* Lifecycle.initialize(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Rehydrator;
  const root = yield* registry.checkout(TestMessage, {});

  yield* Lifecycle.initialize(root);

  expect(hydrator(root)).toMatchSnapshot('initial stacks');
  expect(hash(root)).toMatchSnapshot('initial hash');
  const initial = yield* Lifecycle.encode(root);
  expect(snap(initial?.data)).toMatchSnapshot('initial encoded');

  const event = El.event('actions:0:button:0', {});
  yield* Lifecycle.invoke(root, event);
  yield* Lifecycle.rerender(root);

  expect(hydrator(root)).toMatchSnapshot('rerendered stacks');
  expect(hash(root)).toMatchSnapshot('rerendered hash');
  const rerendered = yield* Lifecycle.encode(root);
  expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Rehydrator;
    const root = yield* registry.checkout(TestMessage, {});
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.rerender(root);

    const event = El.event('buttons:1:button:0', {});

    expect(() => E.runSync(Lifecycle.invoke(root, event) as any)).toThrowErrorMatchingSnapshot();
  }));
});

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Rehydrator.checkout(TestMessage, {});
    yield* Lifecycle.initialize(root);
    yield* Lifecycle.rehydrate(root);

    const event = El.event('actions:0:button:0', {});

    yield* Lifecycle.invoke(root, event);
    yield* Lifecycle.rerender(root);

    yield* Lifecycle.encode(root);
  }
}), {timeout: 10000});
