import * as E from 'effect/Effect';

export type CodecConfig = {
  endpoints: [];
};

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: () => E.gen(function* () {
    return {

    };
  }),
  accessors: true,
}) {}
