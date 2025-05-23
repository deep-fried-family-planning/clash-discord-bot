import {Declare} from '#src/disreact/model/declare.ts';
import {FC} from '#src/disreact/model/elem/fc.ts';
import {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {Pragma} from '#src/disreact/model/pragma';
import {Sources} from '#src/disreact/model/Sources.ts';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import * as Record from 'effect/Record';
import {pipe, flow} from 'effect/Function';
import {MessageAsync} from '#test/unit/components/message-async.tsx';
import {MessageEffect} from '#test/unit/components/message-effect.tsx';
import {MessageSync} from '#test/unit/components/message-sync.tsx';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import {it} from '#test/unit/components/TestRegistry.tsx';

const json = (input: any) => JSON.stringify(input, null, 2);
const snap = (root: Rehydrant) => json(root);
const toStacks = (root: Rehydrant) => Record.map(root.fibrils, (v) => v.stack);
const hash = flow(Rehydrant.dehydrate, S.encodeSync(Declare.Hydrator));

it.effect('when rendering sync', E.fn(function* () {
  const root = yield* Sources.checkout(MessageSync);
  yield* Lifecycles.initialize(root);
  const encoding = yield* Pragma.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageSync));
}));

it.effect('when rendering async', E.fn(function* () {
  const root = yield* Sources.checkout(MessageAsync);
  yield* Lifecycles.initialize(root);
  const encoding = yield* Pragma.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageAsync));
}));

it.effect('when rendering effect', E.fn(function* () {
  const root = yield* Sources.checkout(MessageEffect);
  yield* Lifecycles.initialize(root);
  const encoding = yield* Pragma.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot(FC.getName(MessageEffect));
}));

it.effect('when initial rendering', E.fn(function* () {
  const root = yield* Sources.checkout(TestMessage);
  yield* Lifecycles.initialize(root);
  const encoding = yield* Pragma.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Sources;
  const root = yield* registry.checkout(TestMessage);

  yield* Lifecycles.initialize(root);

  expect(toStacks(root)).toMatchSnapshot('initial stacks');
  expect(hash(root)).toMatchSnapshot('initial hash');
  const initial = yield* Pragma.encode(root);
  expect(snap(initial?.data)).toMatchSnapshot('initial encoded');

  const event = Trigger.make('actions:2:button:0', {});
  yield* Lifecycles.invoke(root, event);
  yield* Lifecycles.rerender(root);

  expect(toStacks(root)).toMatchSnapshot('rerendered stacks');
  expect(hash(root)).toMatchSnapshot('rerendered hash');
  const rerendered = yield* Pragma.encode(root);
  expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Sources;
    const root = yield* registry.checkout(TestMessage);
    yield* Lifecycles.initialize(root);
    yield* Lifecycles.rerender(root);

    const event = Trigger.make('buttons:1:button:0', {});

    expect(() => E.runSync(Lifecycles.invoke(root, event) as any)).toThrowErrorMatchingSnapshot();
  }));
});

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Sources.checkout(TestMessage);
    yield* Lifecycles.initialize(root);
    yield* Lifecycles.rehydrate(root);

    const event = Trigger.make('actions:2:button:0', {});

    yield* Lifecycles.invoke(root, event);
    yield* Lifecycles.rerender(root);

    yield* Pragma.encode(root);
  }
}), {timeout: 10000});
