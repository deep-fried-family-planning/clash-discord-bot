import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as E from 'effect/Effect';
import * as Predicate from 'effect/Predicate';

const TypeId = Symbol.for('disreact/fc'),
      NameId = Symbol.for('disreact/fc/name');

export * as FC from '#src/disreact/model/elem/fc.ts';
export type FC<P = any> = Input<P>;

export const isFC = (fc: any): fc is FC => typeof fc === 'function';

export const SYNC           = 1,
             ASYNC          = 2,
             EFFECT         = 3,
             ANONYMOUS      = 'Anonymous',
             ASYNC_FUNCTION = 'AsyncFunction';

interface Input<P = any> {
  (p: P): Elem.Children | Promise<Elem.Children> | E.Effect<Elem.Children, any, any>;
  _tag?       : typeof SYNC | typeof ASYNC | typeof EFFECT;
  displayName?: string;
  [TypeId]?   : number;
  [NameId]?   : string;
}

export interface Sync extends Input {
  [TypeId]: typeof SYNC;
  (p?: any): Elem.Children;
}

export const isSync = (fc: Input): fc is Sync => fc[TypeId] === SYNC;

export interface Async extends Input {
  [TypeId]: typeof ASYNC;
  (p?: any): Promise<Elem.Children>;
}

export const isAsync = (fc: Input): fc is Async => fc[TypeId] === ASYNC;

export interface Effect extends Input {
  [TypeId]: typeof EFFECT;
  (p?: any): E.Effect<Elem.Children, any, any>;
}

export const isEffect = (fc: Input): fc is Effect => fc[TypeId] === EFFECT;

export const make = (input: FC): Input => {
  const fn = input as Input;

  if (fn[TypeId]) {
    return fn;
  }
  if (fn.constructor.name === ASYNC_FUNCTION) {
    fn[TypeId] = ASYNC;
  }
  if (fn.displayName) {
    fn[NameId] = fn.displayName;
  }
  else if (fn.name) {
    fn[NameId] = fn.name;
  }
  else {
    fn[NameId] = ANONYMOUS;
  }
  return fn;
};

export const isAnonymous = (fc: Input) => fc[NameId] === 'Anonymous';

export const getName = (fc: Input) => fc[NameId] ?? fc.displayName ?? fc.name;

export const render = (fc: FC, p?: any) => {
  if (isSync(fc)) {
    return E.sync(() => fc(p));
  }

  if (isAsync(fc)) {
    return E.promise(async () => await fc(p));
  }

  if (isEffect(fc)) {
    return (fc(p) as E.Effect<Elem.Child>);
  }

  return E.suspend(() => {
    const output = fc(p);

    if (Predicate.isPromise(output)) {
      fc[TypeId] = ASYNC;
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      fc[TypeId] = EFFECT;
      return (output as E.Effect<Elem.Child>);
    }
    fc[TypeId] = SYNC;
    return E.succeed(output);
  });
};
