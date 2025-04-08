import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {E} from '#src/internal/pure/effect.ts';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {it} from 'test/unit/components/TestRegistry.tsx';

it.effect('when hashing version', E.fn(function* () {
  const registry = yield* Registry;

  expect(registry.version).toMatchInlineSnapshot(`981993584`);
}));

it.effect('when hashing version again', E.fn(function* () {
  const registry = yield* Registry;

  expect(registry.version).toMatchInlineSnapshot(`981993584`);
}));
