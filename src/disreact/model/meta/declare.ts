import type {E} from '#src/disreact/utils/re-exports.ts';
import { S} from '#src/disreact/utils/re-exports.ts';
import type { Rehydrant } from '#src/disreact/model/rehydrant.ts';
import {h} from '#src/poll.ts';

export * as Declare from '#src/disreact/model/meta/declare.ts';
export type Declare = never;

export type Encoded<A extends string = string, B = any> =
  | {
      _tag     : A;
      rehydrant: Rehydrant.Decoded;
      data     : B;
    }
  | null;

export const encoded = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag: S.Literal(_tag),
    data: data,
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
