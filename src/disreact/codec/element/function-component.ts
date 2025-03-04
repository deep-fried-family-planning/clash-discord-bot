/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import {E} from '#src/internal/pure/effect.ts';



export const SYNC                   = 'Sync';
export const ASYNC                  = 'Async';
export const EFFECT                 = 'Effect';
export const ASYNC_CONSTRUCTOR_NAME = 'AsyncFunction';
export const ANONYMOUS              = 'Anonymous';

type Base = Function & {
  displayName?: string;
  isModal?    : boolean;
};

export type UnknownFunctionComponent<P, E> = Base & {
  _tag?: string;
  (props: P): E | E[] | Promise<E | E[]> | E.Effect<E | E[], any, any>;
};

export type SyncFunctionComponent<P, E> = Base & {
  _tag: typeof SYNC;
  (props: P): E | E[];
};

export type AsyncFunctionComponent<P, E> = Base & {
  _tag: typeof ASYNC;
  (props: P): Promise<E | E[]>;
};

export type EffectFunctionComponent<P, E> = Base & {
  _tag: typeof EFFECT;
  (props: P): E.Effect<E | E[], any, any>;
};

export type FunctionComponent<P, E> =
  | UnknownFunctionComponent<P, E>
  | SyncFunctionComponent<P, E>
  | AsyncFunctionComponent<P, E>
  | EffectFunctionComponent<P, E>;

export type UFC<P, E> = UnknownFunctionComponent<P, E>;
export type SFC<P, E> = SyncFunctionComponent<P, E>;
export type AFC<P, E> = AsyncFunctionComponent<P, E>;
export type EFC<P, E> = EffectFunctionComponent<P, E>;
export type FC<P = any, E = JSX.Element> = FunctionComponent<P, E>;

export const isSync   = <P, E>(fc: FC<P, E>): fc is SFC<P, E> => fc._tag === SYNC;
export const isAsync  = <P, E>(fc: FC<P, E>): fc is AFC<P, E> => fc._tag === ASYNC;
export const isEffect = <P, E>(fc: FC<P, E>): fc is EFC<P, E> => fc._tag === EFFECT;

export const resolveName = (fc: FC): string => {
  if (fc.displayName) {
    return fc.displayName;
  }
  if (fc.name) {
    return fc.name;
  }
  return ANONYMOUS;
};
