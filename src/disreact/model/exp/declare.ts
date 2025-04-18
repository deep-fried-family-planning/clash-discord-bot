import {Rehydrant} from '#src/disreact/model/elem/rehydrant.ts';
import type {E} from '#src/disreact/utils/re-exports.ts';
import {S} from '#src/disreact/utils/re-exports.ts';

export * as Declare from '#src/disreact/model/exp/declare.ts';
export type Declare = never;

export const SourceId = S.String;

export type Encoded<A extends string = string, B = any> =
  | {
      _tag    : A;
      hydrator: Rehydrant.Decoded;
      data    : B;
    }
  | null;

export const encoded = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag    : S.Literal(_tag),
    hydrator: S.typeSchema(Rehydrant.Decoded),
    data    : data,
  });

export const trigger = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.Struct({
    id  : S.String,
    data: data,
  });

export const handler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    (h): h is (event: typeof data.Type) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length === 1,
  );
