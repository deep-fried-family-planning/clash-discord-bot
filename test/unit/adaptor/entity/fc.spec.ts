import * as FC from '#disreact/a/codec/fc.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Fiber from 'effect/Fiber';
import {inspect} from 'node:util';

let f: FC.Any = (input: string) => `f${input}`;

beforeEach(() => {
  f = (input: string) => `f${input}`;
});

it('when defined', () => {
  expect(f.prototype).toMatchInlineSnapshot(`undefined`);
  expect(f).toMatchInlineSnapshot(`[Function]`);
});

it('when created', () => {
  const fc = FC.make(f);

  expect(fc.prototype).toMatchInlineSnapshot(`undefined`);
  expect(fc.length).toEqual(f.length);
  expect(fc[FC.KindId]).toEqual(undefined);
  expect(fc[FC.NameId]).toEqual(f.name);
  expect(inspect(fc)).toMatchInlineSnapshot(`
    "[Function: f] {
      [Symbol(disreact/fc/name)]: 'f',
      [Symbol(disreact/fc)]: Symbol(disreact/fc)
    }"
  `);
});

it('when named', () => {
  f.displayName = 'test';
  const fc = FC.make(f);
  const id = FC.id(fc);

  expect(f.name).toEqual('f');
  expect(f.displayName).toEqual('test');
  expect(id).toEqual('test');
  expect(inspect(fc)).toMatchInlineSnapshot(`
    "[Function: f] {
      displayName: 'test',
      [Symbol(disreact/fc/name)]: 'test',
      [Symbol(disreact/fc)]: Symbol(disreact/fc)
    }"
  `);
});

it('when called', () => {
  const fc = FC.make(f);

  expect(f('given')).toEqual('fgiven');
  expect(fc('actual')).toEqual('factual');
});

it('when equality checked', () => {
  const fca = FC.make(f);
  const fcb = FC.make(f);

  expect(fca === f).toEqual(true);
  expect(fcb === f).toEqual(true);
  expect(fca === fcb).toEqual(true);
  expect(Equal.equals(fca, fcb)).toEqual(true);
});

describe('given sync fn', () => {
  beforeEach(() => {
    f = FC.make((input) => input);
  });

  it.effect('when rendered', E.fnUntraced(function* () {
    expect(f[FC.KindId]).toEqual(undefined);

    const effect = yield* E.fork(FC.render(f, 'sync'));

    expect(f[FC.KindId]).toEqual(undefined);

    const actual = yield* Fiber.join(effect);

    expect(actual).toEqual('sync');
    expect(f[FC.KindId]).toEqual(FC.SYNC);
  }));

  it.effect('when rerendered', E.fnUntraced(function* () {
    yield* FC.render(f, 'sync');
    const actual = yield* FC.render(f, 'sync');

    expect(actual).toEqual('sync');
    expect(f[FC.KindId]).toEqual(FC.SYNC);
  }));
});

describe('given async fn', () => {
  beforeEach(() => {
    f = FC.make(async (input) => input);
  });

  it.effect('when rendered', E.fnUntraced(function* () {
    expect(f[FC.KindId]).toEqual(FC.PROMISE);

    const effect = yield* E.fork(FC.render(f, 'async'));

    expect(f[FC.KindId]).toEqual(FC.PROMISE);

    const actual = yield* Fiber.join(effect);

    expect(actual).toEqual('async');
    expect(f[FC.KindId]).toEqual(FC.PROMISE);
  }));

  it.effect('when rerendered', E.fnUntraced(function* () {
    yield* FC.render(f, 'async');
    const actual = yield* FC.render(f, 'async');

    expect(actual).toEqual('async');
    expect(f[FC.KindId]).toEqual(FC.PROMISE);
  }));
});

describe('given effect fn', () => {
  beforeEach(() => {
    f = FC.make((input) => E.succeed(input));
  });

  it.effect('when rendered', E.fnUntraced(function* () {
    expect(f[FC.KindId]).toEqual(undefined);

    const effect = yield* E.fork(FC.render(f, 'effect'));

    expect(f[FC.KindId]).toEqual(undefined);

    const actual = yield* Fiber.join(effect);

    expect(actual).toEqual('effect');
    expect(f[FC.KindId]).toEqual(FC.EFFECT);
  }));

  it.effect('when rerendered', E.fnUntraced(function* () {
    yield* FC.render(f, 'effect');
    const actual = yield* FC.render(f, 'effect');

    expect(actual).toEqual('effect');
    expect(f[FC.KindId]).toEqual(FC.EFFECT);
  }));
});
