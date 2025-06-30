import * as E from 'effect/Effect';
import type * as Node from '#disreact/core/Node.ts';

export type CodecConfig = {
  primitive: string;
  encoders : Record<string, (self: Node.Rest, args: any) => any>;
  normalize: Record<string, string>;
};

export class Codec extends E.Service<Codec>()('disreact/Codec', {
  effect: (config: CodecConfig) => E.gen(function* () {
    return {

    };
  }),
  accessors: true,
}) {}
