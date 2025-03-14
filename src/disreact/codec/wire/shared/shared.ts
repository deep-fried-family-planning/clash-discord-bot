import {E} from '#src/internal/pure/effect.ts';
import {DateTime, ParseResult, pipe} from 'effect';
import {annotations, DateTimeUtcFromSelf, Never, Redacted, RedactedFromSelf, String, transformOrFail, Union} from 'effect/Schema';



export const UtcNow = transformOrFail(
  pipe(
    DateTimeUtcFromSelf,
    annotations({
      decodingFallback: () => DateTime.now,
    }),
  ),
  DateTimeUtcFromSelf,
  {
    decode: (now) => E.succeed(now),
    encode: () => DateTime.now,
  },
);

export const Redaction         = Union(RedactedFromSelf(String));
export const RedactionTerminus = Redacted(String);

export const ForbiddenSync = (val: any = undefined) => {
  throw new ParseResult.Forbidden(Never.ast, val, 'ForbiddenTransform');
};

export const ForbiddenEffect = (val: any, _: any) =>
  E.fail(new ParseResult.Forbidden(Never.ast, val, 'ForbiddenTransform'));
