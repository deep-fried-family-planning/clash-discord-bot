import { Elem } from '#src/disreact/model/entity/elem/elem.ts'
import {SourceRegistry} from '#src/disreact/model/entity/SourceRegistry.ts'
import {E} from '#src/internal/pure/effect.ts'
import {TestMessage} from 'test/components/test-message.tsx'
import {it} from 'test/components/TestRegistry.tsx'



describe('disreact/SourceRegistry', () => {
  it.effect('when hashing version', E.fn(function* () {
    const registry = yield* SourceRegistry

    expect(registry.version).toMatchInlineSnapshot(`981993584`)
  }))

  it.effect('when hashing version again', E.fn(function* () {
    const registry = yield* SourceRegistry

    expect(registry.version).toMatchInlineSnapshot(`981993584`)
  }))

  it.effect('when checking out a root', E.fn(function* () {
    const registry = yield* SourceRegistry
    const root     = yield* registry.checkout(TestMessage)
    Elem.linearizeElem(root.elem)
    expect(root).toMatchSnapshot()
  }))

  it.effect('when cloning a root', E.fn(function* () {
    const registry = yield* SourceRegistry
    const root     = yield* registry.checkout(TestMessage)
    const elem     = Elem.deepCloneElem(root.elem)
    Elem.linearizeElem(elem)
    expect(elem).toMatchSnapshot()
  }))
})
