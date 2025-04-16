import {S} from '#src/disreact/utils/re-exports.ts';
import type { Rehydrant } from '#src/disreact/model/rehydrant';

export * as Declare from '#src/disreact/model/declare.ts';
export type Declare = never;

export type Encoded<A extends string = string, B = any> =
  | {
      _tag     : A;
      rehydrant: Rehydrant.Decoded;
      data     : B;
    }
  | null;

export const declareEncoded = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag: S.Literal(_tag),
    data: data,
  });
