import type * as E from 'effect/Effect';
import type * as L from 'effect/Layer';
import type * as Context from 'effect/Context';

export type EA<T> = T extends E.Effect<infer A, infer _, infer __>
  ? A
  : never;

export type EAR<T extends (...args: any[]) => any> = ReturnType<T> extends E.Effect<infer A, infer _, infer __>
  ? A
  : never;

export type CA<T> = T extends Context.Tag<infer _, infer A>
  ? A
  : never;

export type LA<T> = T extends L.Layer<infer A, infer _, infer __>
  ? A
  : never;
