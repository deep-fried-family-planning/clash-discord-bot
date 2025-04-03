import {jsx} from '#src/disreact/jsx-runtime.ts'
import {Elem} from '#src/disreact/model/entity/elem.ts'
import {encodeRoot, Root} from '#src/disreact/model/entity/root.ts'
import {Lifecycles} from '#src/disreact/model/lifecycles.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E} from '#src/internal/pure/effect.ts'
import {pipe, Record} from 'effect'
import {TestMessage} from 'test/components/test-message.tsx'
import {expectJSON, it, nofunc} from 'test/components/TestRegistry.tsx'

it.effect('when cloning a node', E.fn(function* () {
  const registry = yield* SourceRegistry
  const root = yield* registry.checkout(TestMessage)
  const actual = Root.deepLinearize(Root.deepClone(root))
  const expected = Root.deepLinearize(root)

  expect(actual.elem).toEqual(expected.elem)
}))

it.effect('when cloning a tree', E.fn(function* () {
  const registry = yield* SourceRegistry
  const root = yield* registry.checkout(TestMessage)
  const rendered = yield* Lifecycles.rerender(root)

  const exp = pipe(
    rendered.elem,
    Elem.linearizeElem,
  )

  const act = pipe(
    rendered.elem,
    Elem.deepCloneElem,
    Elem.linearizeElem,
  )

  expect(act).toEqual(exp)
}))

it.effect('when rerendering a cloned tree', E.fn(function* () {
  const component = jsx(TestMessage, {})
  const src = Root.make(Root.PUBLIC, component)
  const root = Root.fromSource(src)
  const initial = yield* Lifecycles.initialize(root)
  const actual = yield* Lifecycles.rerender(root)

  expect(nofunc(Elem.linearizeElem(actual.elem))).toEqual(nofunc(Elem.linearizeElem(initial.elem)))
}))

it.effect('when dispatching an event', E.fn(function* () {
  const registry = yield* SourceRegistry
  const root = yield* registry.checkout(TestMessage)
  const initial = yield* Lifecycles.initialize(root)

  const event = {
    id  : 'actions:2:button:0',
    prop: 'onclick',
  }

  expect(Record.map(root.nexus.strands, (v) => v.stack)).toMatchInlineSnapshot(`
    {
      "TestMessage": [
        {
          "s": 0,
        },
      ],
      "TestMessage:message:0:Header:0": [],
    }
  `)

  yield* Lifecycles.handleEvent(initial, event)
  yield* Lifecycles.rerender(root)

  expect(Record.map(root.nexus.strands, (v) => v.stack)).toMatchInlineSnapshot(`
    {
      "TestMessage": [
        {
          "s": 1,
        },
      ],
      "TestMessage:message:0:Header:0": [],
    }
  `)
}))

describe('given event.type is not in any node.props', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* SourceRegistry
    const root = yield* registry.checkout(TestMessage)
    yield* Lifecycles.initialize(root)
    const initial = yield* Lifecycles.rerender(root)
    const event = {
      id  : 'buttons:1:button:0',
      prop: 'onclick',
    }
    yield* pipe(
      Lifecycles.handleEvent(initial, event),
      E.catchAll((err) => {
        expect(err).toMatchInlineSnapshot(`[Error: Event not handled]`)
        return E.void
      }),
    )
  }))
})

describe('given event.id does not match any node.id', () => {
  it.effect('when dispatching an event', E.fn(function* () {
    const registry = yield* SourceRegistry
    const root = yield* registry.checkout(TestMessage)
    yield* Lifecycles.initialize(root)
    const initial = yield* Lifecycles.rerender(root)
    const event = {
      custom_id: 'buttons:1:button:0',
      prop     : 'onclick',
    }
    event.id = 'never'

    yield* pipe(
      Lifecycles.handleEvent(initial, event),
      E.catchAll((err) => {
        expect(err).toMatchInlineSnapshot(`[Error: Event not handled]`)
        return E.void
      }),
    )
  }))
})

it.effect('when rendering an initial tree', E.fn(function* () {
  const registry = yield* SourceRegistry
  const root = yield* registry.checkout(TestMessage)
  const render = yield* Lifecycles.initialize(root)
  yield* pipe(encodeRoot(render), expectJSON('./.json/initial-tree.json'))
}))

it.effect(`when hydrating an empty root (performance)`, E.fn(function* () {
  const runs = Array.from({length: 10000})
  const registry = yield* SourceRegistry

  for (let i = 0; i < runs.length; i++) {
    const root = yield* registry.checkout(TestMessage)
    const expected = yield* Lifecycles.initialize(root)
    const actual = yield* Lifecycles.hydrate(root)

    const event = {
      id  : 'actions:2:button:0',
      prop: 'onclick',
    }
    yield* Lifecycles.handleEvent(root, event)

    const again = yield* Lifecycles.rerender(root)

    expect(Elem.linearizeElem(again.elem)).toEqual(Elem.linearizeElem(actual.elem))
    expect(Elem.linearizeElem(again.elem)).toEqual(Elem.linearizeElem(expected.elem))
    expect(Elem.linearizeElem(actual.elem)).toEqual(Elem.linearizeElem(expected.elem))

    const encoded = encodeRoot(again)

    yield* E.promise(() => expect(JSON.stringify(encoded, null, 2)).toMatchFileSnapshot('./.json/performance.json'))
  }
}), {timeout: 10000})
