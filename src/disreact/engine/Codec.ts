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

export type CodecConfig = {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<string, (self: any) => any>;
};

export class Codec extends Effect.Service<Codec>()('disreact/Codec', {
  effect: Effect.fnUntraced(function* (config: CodecConfig) {
    return {

    };
  }),
  accessors: true,
})
{}
