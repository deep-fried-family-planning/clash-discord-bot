import {E} from '#src/disreact/utils/re-exports.ts';
import {Registry} from 'src/disreact/model/Registry.ts';
import {it} from 'test/unit/components/TestRegistry.tsx';

it.effect('when hashing version', E.fn(function* () {
  const version = yield* Registry.version;

  expect(version).toMatchInlineSnapshot(`981993584`);
}));

it.effect('when hashing version again', E.fn(function* () {
  const version = yield* Registry.version;

  expect(version).toMatchInlineSnapshot(`981993584`);
}));
