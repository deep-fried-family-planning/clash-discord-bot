import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {E} from '#src/internal/pure/effect.ts'
import {it} from 'test/components/TestRegistry.tsx'

describe.skip('given simple rest root element', () => {
  const Element = (
    <message display={'ephemeral'}>
      {'Hello, world!'}
      <embed>
        {'Hello, embed description!'}
        <field name={'field'}>
          {'field text'}
        </field>
      </embed>
    </message>
  )

  it.effect('when synthesizing interaction root', E.fn(function* () {
    const registry = yield* SourceRegistry
    const ref = registry.register('Ephemeral', () => (<Element/>))
    const root = yield* registry.checkout(ref.id)

    expect(JSON.stringify(root, null, 2)).toMatchSnapshot()
  }))
})
