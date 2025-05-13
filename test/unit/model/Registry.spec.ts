import {Sources} from '#src/disreact/model/Sources.ts';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import * as Record from 'effect/Record';
import {pipe, flow} from 'effect/Function';
import {it} from '#test/unit/components/TestRegistry.tsx';

it.effect('when hashing version', E.fn(function* () {
  const version = yield* Sources.version;

  expect(version).toMatchInlineSnapshot(`"-714437688"`);
}));

it.effect('when hashing version again', E.fn(function* () {
  const version = yield* Sources.version;

  expect(version).toMatchInlineSnapshot(`"-714437688"`);
}));
