import {S} from '#src/disreact/utils/re-exports.ts';

export * as Declarations from '#src/disreact/model/declarations.ts';
export type Declarations = never;

export const encoding = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag: S.Literal(_tag),
    data: data,
  });
