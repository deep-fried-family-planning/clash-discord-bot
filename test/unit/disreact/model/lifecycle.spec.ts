import {jsx} from '#src/disreact/jsx-runtime.ts';
import {Elem} from '#src/disreact/model/element/element';
import {hydrateRoot} from '#src/disreact/model/lifecycle/hydrate.ts';
import {invokeIntrinsicTarget} from '#src/disreact/model/lifecycle/invoke.ts';
import { initialRender, rerenderRoot} from '#src/disreact/model/lifecycle/render.ts';
import {Root} from '#src/disreact/model/entity/root.ts';
import {SourceRegistry} from '#src/disreact/model/service/SourceRegistry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import {TestMessage} from 'test/unit/disreact/components/test-message.tsx';
import {expectJSON, it, nofunc} from '../components/TestRegistry.tsx';



it.effect('when cloning a node', E.fn(function* () {
  const root     = yield* SourceRegistry.checkout(TestMessage);
  const actual   = Root.deepLinearize(Root.deepClone(root));
  const expected = Root.deepLinearize(root);

  expect(actual.element).toEqual(expected.element);
}));

it.effect('when cloning a tree', E.fn(function* () {
  const root     = yield* SourceRegistry.checkout(TestMessage);
  const rendered = yield* initialRender(root, root.element);

  const exp = pipe(
    rendered,
    Elem.linearize,
  );

  const act = pipe(
    rendered,
    Elem.deepClone,
    Elem.linearize,
  );

  expect(act).toEqual(exp);
}));

it.effect('when rerendering a cloned tree', E.fn(function* () {
  const component = jsx(TestMessage, {});
  const src       = Root.make(Root.PUBLIC, component);
  const root      = Root.fromSource(src);
  const initial   = yield* initialRender(root, root.element);
  const actual    = yield* rerenderRoot(root);

  expect(nofunc(actual.element)).toEqual(nofunc(initial));
}));

it.effect('when dispatching an event', E.fn(function* () {
  const root    = yield* SourceRegistry.checkout(TestMessage);
  const initial = yield* initialRender(root, root.element);

  const event = {
    custom_id: 'actions:2:button:0',
    prop     : 'onclick',
  } as any;

  const before = Elem.deepClone(initial);
  invokeIntrinsicTarget(initial, event);
  const rerendered = yield* rerenderRoot(root);

  const beforeStacks = Elem.reduceToStacks(Elem.collectStates(before));
  const actualStacks = Elem.reduceToStacks(Elem.collectStates(rerendered.element));

  const snap = {
    before: beforeStacks[TestMessage.name],
    after : actualStacks[TestMessage.name],
  };

  expect(snap).toMatchInlineSnapshot(`
    {
      "after": [
        {
          "s": 1,
        },
      ],
      "before": [
        {
          "s": 0,
        },
      ],
    }
  `);
}));

describe('given event.type is not in any node.props', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const root = yield* SourceRegistry.checkout(TestMessage);
    yield* initialRender(root, root.element);
    const initial = yield* rerenderRoot(root);
    const event   = {
      custom_id: 'buttons:1:button:0',
      prop     : 'onclick',
    } as any;
    // event.prop = 'never';
    const actual  = () => invokeIntrinsicTarget(initial.element, event);
    expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "onclick" was not found]`);
  }));
});

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const root = yield* SourceRegistry.checkout(TestMessage);
    yield* initialRender(root, root.element);
    const initial = yield* rerenderRoot(root);
    const event   = {
      custom_id: 'buttons:1:button:0',
      prop     : 'onclick',
    } as any;
    event.id      = 'never';

    const actual = () => invokeIntrinsicTarget(initial.element, event);
    expect(actual).toThrowErrorMatchingInlineSnapshot(`[Error: No node with id_step "buttons:1:button:0" having a handler for type "onclick" was not found]`);
  }));
});


it.effect('when rendering an initial tree', E.fn(function* () {
  const root   = yield* SourceRegistry.checkout(TestMessage);
  const render = yield* initialRender(root, root.element);
  yield* pipe(render, Elem.linearize, expectJSON('./initial-tree.json'));
}));

describe('performance', {timeout: 10000}, () => {
  const runs = Array.from({length: 10000});

  it.effect(`when hydrating an empty root`, E.fn(function* () {
    for (let i = 0; i < runs.length; i++) {
      const root     = yield* SourceRegistry.checkout(TestMessage);
      const expected = yield* initialRender(root, root.element);
      const actual   = yield* hydrateRoot(root, root.element, {});
      expect(Elem.linearize(actual)).toEqual(Elem.linearize(expected));
    }
  }));
});
