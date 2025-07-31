import type * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

export class ModelEncodeError extends Data.TaggedError('ModelEncodeError')<{
  cause: Cause.Cause<Error> | Error;
}>
{}

export class ModelDecodeError extends Data.TaggedError('ModelDecodeError')<{
  cause: Cause.Cause<Error> | Error;
}>
{}

export type CodecUnit = {
  type    : string;
  props   : Record<string, any>;
  children: CodecUnit[];
};

export type CodecConfig = {};

export class Codec extends Effect.Service<Codec>()('disreact/Transformer', {
  effect: Effect.fnUntraced(function* (config: CodecConfig) {
    return {};
  }),
  accessors: true,
})
{}
