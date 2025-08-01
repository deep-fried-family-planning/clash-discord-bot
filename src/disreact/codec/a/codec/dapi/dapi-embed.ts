import * as S from 'effect/Schema';

export * as DAPIEmbed from '#disreact/codec/a/codec/dapi/dapi-embed.ts';
export type DAPIEmbed = never;

export const Embed = S.Struct({
  author: S.optional(S.Struct({
    name: S.String,
    url : S.optional(S.String),
  })),

  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Number),
  url        : S.optional(S.String),
  timestamp  : S.optional(S.String),

  image: S.optional(S.Struct({
    url: S.optional(S.String),
  })),

  fields: S.optional(S.Array(S.Struct({
    name  : S.String,
    value : S.String,
    inline: S.optional(S.Boolean),
  }))),

  footer: S.optional(S.Struct({
    text: S.String,
  })),
});
