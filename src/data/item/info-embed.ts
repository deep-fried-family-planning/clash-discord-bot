import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
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

export const Key = Table.Key({
  pk: Id.EmbedId,
  sk: Id.PartitionRoot,
});

export const TAG = DataTag.DISCORD_EMBED;
export const LATEST = 0;

export const Item = Table.Item(TAG, LATEST, {
  pk   : Id.EmbedId,
  sk   : Id.PartitionRoot,
  embed: ApiEmbed,
});

export const Versions = S.Union(
  Item,
);

export type Type = typeof Item.Type;
export type Encoded = typeof Item.Encoded;
export const is = S.is(Item);
export const make = Item.make;
export const equal = S.equivalence(Item);
export const decode = S.decode(Versions);
export const encode = S.encode(Item);

export const createInfoEmbed = Document.Put(Item);
export const update = Document.Update(Key);
export const read = Document.Get(Key, Versions);
const $delete = Document.Delete(Key);
export {$delete as delete};

export const put = Document.Put(Item);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
