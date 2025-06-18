/* eslint-disable require-yield */
import * as E from 'effect/Effect';

export type ModelCodecConfig = {
  primitive    : string;
  normalization: Record<string, string>;
  encoders     : Record<string, (self: any, acc: any) => any>;
};

export class ModelCodec extends E.Service<ModelCodec>()('disreact/ModelCodec', {
  effect: E.fnUntraced(function* (config: ModelCodecConfig) {
    const encodeRoot = () => {};

    return {};
  }),
  accessors: true,
}) {}
