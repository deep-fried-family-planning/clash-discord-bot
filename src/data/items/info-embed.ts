import * as Document from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
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

const ApiEmbed = S.Struct({
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

export const Key = Table.CompKey(Id.EmbedId, Id.PartitionRoot);

export const TAG = DataTag.DISCORD_EMBED;
export const LATEST = 0;

export const Latest = Table.Item(TAG, LATEST, {
  pk   : Id.EmbedId,
  sk   : Id.PartitionRoot,
  embed: ApiEmbed,
});

export const Versions = S.Union(
  Latest,
);

export const is = S.is(Latest);
export const make = Latest.make;
export const equals = S.equivalence(Latest);
export const decode = S.decode(Versions);
export const encode = S.encode(Latest);
export const create = Document.Put(Latest);
export const read = Document.GetUpgradeV1(Key, Versions);
export const update = Document.Update(Key);
const delete$ = Document.Delete(Key);
export {delete$ as delete};
