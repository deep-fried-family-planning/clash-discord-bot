import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {decode, encode} from '@msgpack/msgpack';
import {deflate, inflate} from 'pako';
import * as S from 'effect/Schema';
import type * as E from 'effect/Effect';

export * as Declare from '#src/disreact/model/declare.ts';
export type Declare = never;

export const SourceId = S.String;

export const Hydrator = S.transform(
  S.String,
  S.Struct({
    id    : S.String,
    props : S.optional(S.Any),
    stacks: S.Record({key: S.String, value: Fibril.Chain}),
  }),
  {
    encode: (dry) => {
      const pack = encode(dry);
      const pako = deflate(pack);
      return Buffer.from(pako).toString('base64url');
    },
    decode: (hash) => {
      const buff = Buffer.from(hash, 'base64url');
      const pako = inflate(buff);
      return decode(pako) as any;
    },
  },
);

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
    hydrator: S.typeSchema(Hydrator),
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
