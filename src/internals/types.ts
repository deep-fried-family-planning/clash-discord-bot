import type {E} from '#src/internals/re-exports/effect.ts';

export type EA<T> = T extends E.Effect<infer A>
    ? A
    : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any
export type EAR<T extends (...args: any[]) => any> = ReturnType<T> extends E.Effect<infer A, infer _, infer __>
    ? A
    : never;
