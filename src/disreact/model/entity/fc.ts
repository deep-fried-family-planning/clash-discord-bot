import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {E} from '#src/internal/pure/effect.ts';
import {type Cause, Predicate} from 'effect';

export const TypeId = Symbol('disreact/fc'),
             NameId = Symbol('disreact/fc/name');

export * as FC from '#src/disreact/model/entity/fc.ts';
export type FC = Input;

export const SYNC           = 1,
             ASYNC          = 2,
             EFFECT         = 3,
             ANONYMOUS      = 'Anonymous',
             ASYNC_FUNCTION = 'AsyncFunction';

interface Input {
  [TypeId]?   : number;
  [NameId]?   : string;
  (p?: any): Elem.Return | Promise<Elem.Return> | E.Effect<Elem.Return, any, any>;
  displayName?: string;
  sourceName? : string;
}
export interface Sync extends Input {
  [TypeId]: typeof SYNC;
  (p?: any): Elem.Return;
}
export interface Async extends Input {
  [TypeId]: typeof ASYNC;
  (p?: any): Promise<Elem.Return>;
}
export interface Effect extends Input {
  [TypeId]: typeof EFFECT;
  (p?: any): E.Effect<Elem.Return, any, any>;
}

export const isFC        = (fc: any): fc is FC => typeof fc === 'function' && fc[TypeId],
             isSync      = (fc: FC): fc is Sync => fc[TypeId] === SYNC,
             isAsync     = (fc: FC): fc is Async => fc[TypeId] === ASYNC,
             isEffect    = (fc: FC): fc is Effect => fc[TypeId] === EFFECT,
             isAnonymous = (fc: FC) => fc[NameId] === 'Anonymous';

export const getName = (fc: FC) => (fc as Input)[NameId]!;

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

export const source = (self: FC): FC => {
  const fc = make(self);

  if (fc[NameId] === ANONYMOUS) {
    throw new Error(`Source cannot be named ${ANONYMOUS}`);
  }

  return fc;
};

const ensure = (cs: Elem.Return) => {
  if (!cs) {
    return [];
  }
  if (Array.isArray(cs)) {
    return cs;
  }
  return [cs];
};

export const render = (fc: FC, p?: any): E.Effect<Elem.Any[], Cause.UnknownException> => {
  if (isSync(fc)) {
    return E.try(() => ensure(fc(p)));
  }

  if (isAsync(fc)) {
    return E.tryPromise(() => fc(p).then(ensure));
  }

  if (isEffect(fc)) {
    return (fc(p) as E.Effect<Elem.Return>).pipe(E.map(ensure));
  }

  return E.suspend(() => {
    const output = fc(p);

    if (Predicate.isPromise(output)) {
      fc[TypeId] = ASYNC;
      return E.tryPromise(() => output.then(ensure));
    }

    if (E.isEffect(output)) {
      fc[TypeId] = EFFECT;
      return (output as E.Effect<Elem.Return>).pipe(E.map(ensure));
    }

    fc[TypeId] = SYNC;
    return E.succeed(ensure(output));
  });
};
