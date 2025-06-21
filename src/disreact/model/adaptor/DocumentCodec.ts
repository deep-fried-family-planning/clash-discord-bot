import * as E from 'effect/Effect';

export type DocumentCodecConfig = {};

export class DocumentCodec extends E.Service<DocumentCodec>()('disreact/DocumentCodec', {
  effect   : () => E.succeed({}),
  accessors: true,
}) {}
