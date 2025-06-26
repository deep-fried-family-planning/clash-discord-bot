import * as Element from '#src/disreact/codec/adaptor/exp/domain/old/element.ts';
import * as Rehydrant from '#src/disreact/codec/adaptor/exp/domain/old/envelope.ts';
import * as Lifecycle from '#src/disreact/codec/adaptor/exp/v1lifecycle.ts';
import {Rehydrator} from '#src/disreact/codec/adaptor/exp/Rehydrator.ts';
import * as Declarations from '#src/disreact/codec/old/declarations.ts';
import {MessageAsync} from '#unit/components/message-async.tsx';
import {MessageEffect} from '#unit/components/message-effect.tsx';
import {MessageSync} from '#unit/components/message-sync.tsx';
import {TestMessage} from '#unit/components/test-message.tsx';
import {it} from '#unit/components/TestRegistry.tsx';
import * as E from 'effect/Effect';
import {flow} from 'effect/Function';
import * as S from 'effect/Schema';

const json = (input: any) => JSON.stringify(input, null, 2);
const snap = (root: Rehydrant.Envelope) => json(root);
const hydrator = (root: Rehydrant.Envelope) => Rehydrant.dehydrate(root);
const hash = flow(Rehydrant.dehydrate, S.encodeSync(Declarations.HydratorTransform));

it.effect('when rendering sync', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageSync, {});
  yield* Lifecycle.init__(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
  expect(root.root).toMatchSnapshot();
}));

it.effect('when rendering async', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageAsync, {});
  yield* Lifecycle.init__(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when rendering effect', E.fn(function* () {
  const root = yield* Rehydrator.checkout(MessageEffect, {});
  yield* Lifecycle.init__(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when initial rendering', E.fn(function* () {
  const root = yield* Rehydrator.checkout(TestMessage, {});
  yield* Lifecycle.init__(root);
  const encoding = yield* Lifecycle.encode(root);
  expect(snap(encoding?.data)).toMatchSnapshot();
}));

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* Rehydrator;
  const root = yield* registry.checkout(TestMessage, {});

  yield* Lifecycle.init__(root);

  const initial = yield* Lifecycle.encode(root);
  expect(snap(initial?.data)).toMatchSnapshot('initial encoded');

  const event = Element.event('actions:0:button:0', {});
  yield* Lifecycle.invoke2(root, event);
  yield* Lifecycle.rerenders(root);

  expect(hydrator(root)).toMatchSnapshot('rerendered stacks');
  expect(hash(root)).toMatchSnapshot('rerendered hash');
  const rerendered = yield* Lifecycle.encode(root);
  expect(snap(rerendered?.data)).toMatchSnapshot('rerendered encoded');
}));

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* Rehydrator;
    const root = yield* registry.checkout(TestMessage, {});
    yield* Lifecycle.init__(root);
    yield* Lifecycle.rerenders(root);

    const event = Element.event('buttons:1:button:0', {});

    expect(() => E.runSync(Lifecycle.invoke2(root, event) as any)).toThrowErrorMatchingSnapshot();
  }));
});

it.effect(`when hydrating an empty root (performance)`, E.fnUntraced(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Rehydrator.checkout(TestMessage, {}, {});
    yield* Lifecycle.init__(root);
    yield* Lifecycle.rehydrate__(root);

    const event = Element.event('actions:0:button:0', {});

    yield* Lifecycle.invoke2(root, event);
    yield* Lifecycle.rerenders(root);

    yield* Lifecycle.encode(root);
  }
}), {timeout: 10000});
