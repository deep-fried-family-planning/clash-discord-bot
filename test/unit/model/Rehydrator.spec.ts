import * as Element from '#src/disreact/adaptor/adaptor/element.ts';
import {Rehydrator} from '#src/disreact/adaptor/adaptor/Rehydrator.ts';
import {TestDialog} from '#unit/components/test-dialog.tsx';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';

it.effect('when initialized', E.fn(
  function* () {
    const actual = yield* Rehydrator;

    expect(actual).toMatchInlineSnapshot(`
      Rehydrator {
        "checkout": [Function],
        "register": [Function],
        "rehydrate": [Function],
      }
    `);
  },
  E.provide(Rehydrator.Default()),
));

describe('given no sources', () => {
  it.effect('when registering', E.fn(
    function* () {
      yield* Rehydrator.register(TestDialog);
      const actual = yield* Rehydrator.checkout(TestDialog, {}, {});

      expect(actual).toMatchSnapshot('then the rehydrant envelope is initialized');
    },
    E.provide(Rehydrator.Default()),
  ));

  it.effect('when checking out', E.fn(
    function* () {
      const actual = yield* Rehydrator.checkout(TestDialog, {}, {}).pipe(E.merge);

      expect(actual).toMatchSnapshot('then a defect is returned');
    },
    E.provide(Rehydrator.Default()),
  ));

  it.effect('when rehydrating', E.fn(
    function* () {
      const actual = yield* Rehydrator.checkout(TestDialog, {}, {}).pipe(E.merge);

      expect(actual).toMatchSnapshot('then a defect is returned');
    },
    E.provide(Rehydrator.Default()),
  ));
});

describe('given function component source', () => {
  const layer = Rehydrator.Default({sources: [TestDialog]});

  it.effect('when registering again', E.fn(
    function* () {
      const actual = yield* Rehydrator.register(TestDialog).pipe(E.merge);

      expect(actual).toMatchSnapshot('then a defect is returned');
    },
    E.provide(layer),
  ));

  it.effect('when checking out', E.fn(
    function* () {
      const actual = yield* Rehydrator.checkout(TestDialog, {}, {});

      expect(actual).toMatchSnapshot('then the rehydrant envelope is initialized');
    },
    E.provide(layer),
  ));

  it.effect('when rehydrating', E.fn(
    function* () {
      const actual = yield* Rehydrator.rehydrate(
        {
          id    : TestDialog.name,
          stacks: {},
          props : {},
        },
        {data: 'data'},
      );

      expect(actual).toMatchSnapshot('then the rehydrant envelope is initialized');
    },
    E.provide(layer),
  ));
});

describe('given element source', () => {
  const source = Element.jsx(TestDialog, {});
  const layer = Rehydrator.Default({sources: [source]});

  it.effect('when registering again', E.fn(
    function* () {
      const actual = yield* Rehydrator.register(source).pipe(E.merge);

      expect(actual).toMatchSnapshot('then a defect is returned');
    },
    E.provide(layer),
  ));

  it.effect('when checking out', E.fn(
    function* () {
      const actual = yield* Rehydrator.checkout(source, {}, {});

      expect(actual).toMatchSnapshot('then the rehydrant envelope is initialized');
    },
    E.provide(layer),
  ));

  it.effect('when rehydrating', E.fn(
    function* () {
      const actual = yield* Rehydrator.rehydrate(
        {
          id    : TestDialog.name,
          stacks: {},
          props : {},
        },
        {data: 'data'},
      );

      expect(actual).toMatchSnapshot('then the rehydrant envelope is initialized');
    },
    E.provide(layer),
  ));
});
