import * as E from 'effect/Effect';
import {hole} from 'effect/Function';
import * as ParseResult from 'effect/ParseResult';
import * as S from 'effect/Schema';
import type {ParseOptions} from 'effect/SchemaAST';

export const ForbiddenTransformSync = hole;

export const decodeOrFail = <A, I, R, A2, I2, R2, E, R3>(
  from: S.Schema<A, I, R>,
  to: S.Schema<A2, I2, R2>,
  decode: (fromA: A, fromI: I, options: ParseOptions) => E.Effect<I2, E, R3>,
) =>
  S.transformOrFail(
    from,
    to,
    {
      decode: (fromA, options, ast, fromI) =>
        decode(fromA, fromI, options).pipe(
          E.catchAllCause((cause) => ParseResult.fail(new ParseResult.Unexpected(cause))),
        ),
      encode: (fromI, options, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(ast, fromI),
        ),
    },
  );

export const encodeOrFail = <A, I, R, A2, I2, R2, E, R3>(
  to: S.Schema<A2, I2, R2>,
  from: S.Schema<A, I, R>,
  encode: (toI: I2, toA: A2, options: ParseOptions) => E.Effect<A, E, R3>,
) =>
  S.transformOrFail(
    from,
    to,
    {
      strict: true,
      decode: (toA, options, ast) =>
        ParseResult.fail(
          new ParseResult.Forbidden(ast, 'encodeOrFail: fail includes decode'),
        ),
      encode: (toI, options, ast, toA) =>
        encode(toI, toA, options).pipe(
          E.catchAllCause((cause) => ParseResult.fail(new ParseResult.Unexpected(cause))),
        ),
    },
  );

export const decodeOnly = <A, I, R, A2, I2, R2>(
  from: S.Schema<A, I, R>,
  to: S.Schema<A2, I2, R2>,
  decode: (fromA: A, fromI: I) => I2,
) =>
  S.transform(
    from,
    to,
    {
      decode: decode,
      encode: hole,
    },
  );

export const encodeOnly = <A, I, R, A2, I2, R2>(
  to: S.Schema<A2, I2, R2>,
  from: S.Schema<A, I, R>,
  encode: (toI: I2, toA: A2) => A,
) =>
  S.transform(
    from,
    to,
    {
      decode: hole,
      encode: encode,
    },
  );
