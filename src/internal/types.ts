import type {E, L} from '#src/internal/pure/effect.ts';
import type {Context} from 'effect';


export type EA<T> = T extends E.Effect<infer A, infer _, infer __>
    ? A
    : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EAR<T extends (...args: any[]) => any> = ReturnType<T> extends E.Effect<infer A, infer _, infer __>
    ? A
    : never;


export type CA<T> = T extends Context.Tag<infer _, infer A>
    ? A
    : never;


export type LA<T> = T extends L.Layer<infer A, infer _, infer __>
    ? A
    : never;


export type AnyE<T> = T extends E.Effect<infer A, infer _, infer __>
    ? E.Effect<A, any, any>
    : E.Effect<T, any, any>;
