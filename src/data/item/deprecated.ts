import type {str} from '#src/internal/pure/types-pure.ts';
import type * as Brand from 'effect/Brand';
import * as S from 'effect/Schema';

const StartsWithId = <T extends string>(start: string, brand: T) => S.transform(
  S.String.pipe(S.startsWith(start), S.brand(brand)),
  S.String,
  {
    strict: true,
    decode: (s) => s.replace(start, '') as string & Brand.Brand<typeof brand>,
    encode: (s) => start.concat(s) as string & Brand.Brand<typeof brand>,
  },
);

export const NowId = S.Literal('now');
export const ServerId = StartsWithId('s-', 'ServerId');
export const UserId = StartsWithId('u-', 'UserId');
export const ChannelId = S.String;
export const RoleId = S.String;
export const ThreadId = S.String;
export const MessageId = S.String;
export const ClanTag = StartsWithId('c-', 'ClanTag');
export const PlayerTag = StartsWithId('p-', 'PlayerTag');
export const InfoId = StartsWithId('i-', 'InfoId');
export const EmbedId = StartsWithId('e-', 'InfoId');

export const DiscordClan = S.Struct({
  type: S.Literal('DiscordClan'),

  pk: ServerId,
  sk: ClanTag,

  gsi_server_id: ServerId,
  gsi_clan_tag : ClanTag,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  embed_id: S.optional(EmbedId),

  verification: S.Enums({
    admin    : 0,
    elder    : 1,
    coleader : 2,
    leader   : 3,
    developer: 4,
  }).pipe(S.optionalWith({default: () => 0})),

  name : S.String.pipe(S.optionalWith({default: () => ''})),
  alias: S.String.pipe(S.optionalWith({default: () => ''})),
  desc : S.String.pipe(S.optionalWith({default: () => ''})),
  uses : S.Array(S.String).pipe(S.optionalWith({default: () => [] as str[]})),

  thread_prep    : ThreadId,
  prep_opponent  : ClanTag,
  thread_battle  : ThreadId,
  battle_opponent: ClanTag,
  countdown      : ThreadId,
});

export const DiscordUser = S.Struct({
  pk     : UserId,
  sk     : NowId,
  type   : S.Literal('DiscordUser'),
  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  gsi_all_user_id: UserId,

  embed_id: S.optional(EmbedId),

  timezone: S.TimeZone,

  quiet: S.optional(S.String),
});

export const DiscordServer = S.Struct({
  type: S.Literal('DiscordServer'),

  pk: ServerId,
  sk: NowId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  gsi_all_server_id: ServerId,

  embed_id: S.optional(EmbedId),

  omni_channel_id: S.optional(ChannelId),
  omni_message_id: S.optional(MessageId),

  name : S.String.pipe(S.optionalWith({default: () => ''})),
  alias: S.String.pipe(S.optionalWith({default: () => ''})),
  desc : S.String.pipe(S.optionalWith({default: () => ''})),

  polling : S.Boolean,
  timezone: S.optional(S.TimeZone),

  announcements: S.optional(ChannelId),
  info         : S.optional(ChannelId),
  general      : S.optional(ChannelId),
  slash        : S.optional(ChannelId),
  staff        : S.optional(ChannelId),
  forum        : S.optional(ChannelId),
  errors       : S.optional(ChannelId),

  raids: S.optional(ThreadId),

  admin : RoleId,
  member: S.optional(RoleId),
  guest : S.optional(RoleId),
});

export const DiscordPlayer = S.Struct({
  pk: UserId,
  sk: PlayerTag,

  type   : S.Literal('DiscordPlayer'),
  version: S.Literal('1.0.0'),

  created: S.Date,
  updated: S.Date,

  gsi_user_id   : UserId,
  gsi_player_tag: PlayerTag,

  embed_id: S.optional(EmbedId),

  alias: S.optional(S.String),

  verification: S.Enums({
    none     : 0,
    admin    : 1,
    token    : 2,
    developer: 3,
  }),

  account_type: S.String,
});

const DiscordApiEmbed = S.Struct({
  type: S.optional(S.Enums({
    RICH       : 'rich',
    IMAGE      : 'image',
    VIDEO      : 'video',
    GIFV       : 'gifv',
    ARTICLE    : 'article',
    LINK       : 'link',
    POLL_RESULT: 'poll_result',
  } as const)),
  provider: S.optional(S.Struct({
    name: S.optional(S.String),
    url : S.optional(S.String),
  })),
  image: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
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

export const DiscordEmbed = S.Struct({
  type: S.Literal('DiscordEmbed'),

  pk: EmbedId,
  sk: NowId,

  gsi_embed_id: EmbedId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  original_type     : S.String,
  original_pk       : S.String,
  original_sk       : S.String,
  original_server_id: ServerId,
  original_user_id  : UserId,

  embed: DiscordApiEmbed,
});
