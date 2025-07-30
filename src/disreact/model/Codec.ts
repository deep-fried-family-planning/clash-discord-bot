import * as Effect from 'effect/Effect';
import * as Data from 'effect/Data';

export class ModelCodecError extends Data.TaggedError('EncodingError')<{}> {}

export type Encodable = {
  type    : string;
  props   : Record<string, any>;
  children: Encodable[];
};

export type CodecConfig = {

};



export class Codec extends Effect.Service<Codec>()('disreact/Transformer', {
  effect: Effect.fnUntraced(function* (config: CodecConfig) {
    return {

    };
  }),
  accessors: true,
}) {}
