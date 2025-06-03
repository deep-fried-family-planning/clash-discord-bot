import * as S from 'effect/Schema';

const ApiEmbedType = S.Enums({
  RICH       : 'rich',
  IMAGE      : 'image',
  VIDEO      : 'video',
  GIFV       : 'gifv',
  ARTICLE    : 'article',
  LINK       : 'link',
  POLL_RESULT: 'poll_result',
} as const);

const ApiEmbedProvider = S.Struct({
  name: S.optional(S.String),
  url : S.optional(S.String),
});

const ApiEmbedImage = S.Struct({
  url      : S.optional(S.String),
  proxy_url: S.optional(S.String),
  height   : S.optional(S.Number),
  width    : S.optional(S.Number),
});

export const ApiEmbed = S.Struct({
  type     : S.optional(ApiEmbedType),
  provider : S.optional(ApiEmbedProvider),
  image    : S.optional(ApiEmbedImage),
  thumbnail: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
  video: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
  author: S.optional(S.Struct({
    name          : S.String,
    url           : S.optional(S.String),
    icon_url      : S.optional(S.String),
    proxy_icon_url: S.optional(S.String),
  })),
  color      : S.optional(S.Number),
  title      : S.optional(S.String),
  url        : S.optional(S.String),
  description: S.optional(S.String),
  footer     : S.optional(S.Struct({
    text          : S.optional(S.String),
    icon_url      : S.optional(S.String),
    proxy_icon_url: S.optional(S.String),
  })),
  fields: S.optional(S.Array(S.Struct({
    name  : S.String,
    value : S.String,
    inline: S.optional(S.Boolean),
  }))),
  timestamp: S.optional(S.String),
});
