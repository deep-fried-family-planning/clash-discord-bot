import {Sources} from '#src/disreact/model/Sources.ts';
import {E} from '#src/disreact/utils/re-exports.ts';
import {it} from '#test/unit/components/TestRegistry.tsx';

it.effect('when hashing version', E.fn(function* () {
  const version = yield* Sources.version;

  expect(version).toMatchInlineSnapshot(`"-714437688"`);
}));

it.effect('when hashing version again', E.fn(function* () {
  const version = yield* Sources.version;

  expect(version).toMatchInlineSnapshot(`"-714437688"`);
}));
