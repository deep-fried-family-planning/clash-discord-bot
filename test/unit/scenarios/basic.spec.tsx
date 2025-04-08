import {Registry} from '#src/disreact/model/Registry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it} from 'test/unit/components/TestRegistry.tsx';

describe.skip('given simple rest root element', () => {
  it.effect('when synthesizing interaction root', E.fn(function* () {
    const registry = yield* Registry;
    const ref = registry.register('Ephemeral', () => (<Element/>));
    const root = yield* registry.checkout(ref.id);

    expect(JSON.stringify(root, null, 2)).toMatchSnapshot();
  }));
});
