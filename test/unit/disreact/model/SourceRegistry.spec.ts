import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {it } from 'test/unit/disreact/components/TestRegistry.tsx';



describe('disreact/SourceRegistry', () => {
  it.effect('maintains a stable version hash', E.fn(function* () {
    const registry = yield* SourceRegistry;

    expect(registry.version).toMatchInlineSnapshot(`981993584`);
  }));

  it.effect('maintains a stable version hash again', E.fn(function* () {
    const registry = yield* SourceRegistry;

    expect(registry.version).toMatchInlineSnapshot(`981993584`);
  }));
});
