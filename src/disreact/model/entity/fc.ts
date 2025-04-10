import type {Elem} from '#src/disreact/model/entity/elem.ts';
import {E} from '#src/internal/pure/effect.ts';
import {type Cause, pipe, Predicate} from 'effect';

const ANONYMOUS = 'Anonymous';
const ASYNC_FUNCTION = 'AsyncFunction';

export const TypeId = Symbol('disreact/fc'),
             NameId = Symbol('disreact/fc/name');

export const SYNC   = 1,
             ASYNC  = 2,
             EFFECT = 3;

export interface Input {
  (p?: any): Elem.Children | Promise<Elem.Children> | E.Effect<Elem.Children, any, any>;
  displayName?: string;
  sourceName? : string;
}

export interface Base extends Input {
  [NameId]?: string;
  [TypeId]?: number;
}

export interface Sync extends Base {
  [TypeId]: typeof SYNC;
  (p?: any): Elem.Children;
}

export interface Async extends Base {
  [TypeId]: typeof ASYNC;
  (p?: any): Promise<Elem.Children>;
}

export interface Effect extends Base {
  [TypeId]: typeof EFFECT;
  (p?: any): E.Effect<Elem.Children, any, any>;
}

export * as FC from '#src/disreact/model/entity/fc.ts';
export type FC = Input;

export const isFC = (fc: any): fc is FC => typeof fc === 'function';
export const isSync = (fc: FC): fc is Sync => (fc as Base)[TypeId] === SYNC;
export const isAsync = (fc: FC): fc is Async => (fc as Base)[TypeId] === ASYNC;
export const isEffect = (fc: FC): fc is Effect => (fc as Base)[TypeId] === EFFECT;

export const match = <A>(self: FC, m: {
  Sync   : (fc: Sync) => A;
  Async  : (fc: Async) => A;
  Effect : (fc: Effect) => A;
  Unknown: (fc: Base) => A;
}) => {
  if (typeof self !== 'function' || !(self instanceof Function)) {
    throw new Error();
  }

  const fc = self as Base;

  switch (fc[TypeId]) {
    case SYNC:
      return m.Sync(fc as Sync);
    case ASYNC:
      return m.Async(fc as Async);
    case EFFECT:
      return m.Effect(fc as Effect);
    default:
      return m.Unknown(fc);
  }
};

export const getName = (fc: FC) => (fc as Base)[NameId]!;

export const getSrcId = (fc: FC) => (fc as any)[NameId]! as string;

export const make = (input: FC): Base => {
  const fc = input as Base;

  if (fc[TypeId]) return fc;

  if (fc.constructor.name === ASYNC_FUNCTION) fc[TypeId] = ASYNC;

  if (fc.displayName) fc[NameId] = fc.displayName;
  else if (fc.name) fc[NameId] = fc.name;
  else fc[NameId] = ANONYMOUS;

  return fc;
};

export const source = (self: FC): FC => {
  const fc = make(self);

  if (fc[NameId] === ANONYMOUS) {
    throw new Error(`Source cannot be named ${ANONYMOUS}`);
  }
  return fc;
};

const ensure = (cs: Elem.Children) => {
  if (!cs) {
    return [];
  }
  if (Array.isArray(cs)) {
    return cs;
  }
  return [cs];
};

export const render = (self: FC, p?: any): E.Effect<Elem.Any[], Cause.UnknownException> => {
  const fc = self as Base;

  if (isSync(fc)) {
    return E.try(() => ensure(fc(p)));
  }
  if (isAsync(fc)) {
    return E.tryPromise(() => fc(p).then(ensure));
  }
  if (isEffect(fc)) {
    return (fc(p) as E.Effect<Elem.Children>).pipe(E.map(ensure));
  }
  return pipe(
    E.try(() => fc(p)),
    E.flatMap((output) => {
      if (Predicate.isPromise(output)) {
        fc[TypeId] = ASYNC;
        return E.tryPromise(() => output.then(ensure));
      }
      if (E.isEffect(output)) {
        fc[TypeId] = EFFECT;
        return (output as E.Effect<Elem.Children>).pipe(E.map(ensure));
      }
      fc[TypeId] = SYNC;
      return E.succeed(ensure(output));
    }),
  );
};
