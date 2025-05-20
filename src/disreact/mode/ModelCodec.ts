import * as JsxDefault from '#src/disreact/mode/entity/jsx-schema.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export type ModelCodecConfig = {
  primitive?    : string;
  normalization?: Record<string, string>;
  encoding?     : Record<string, (self: any, acc: any) => any>;
};

const make = (config: ModelCodecConfig) => {
  const {
    primitive     = JsxDefault.primitive,
    normalization = JsxDefault.normalization,
    encoding      = JsxDefault.encoding,
  } = config;

  return {
    primitive,
    normalization,
    encoding,
  };
};

export class ModelCodec extends E.Service<ModelCodec>()('disreact/ModelCodec', {
  succeed: make({}),
}) {
  static readonly config = (config: ModelCodecConfig) =>
    L.succeed(
      ModelCodec,
      ModelCodec.make(make(config)),
    );
}
