import {S} from '#src/internal/pure/effect.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';
import {EmbedId, NowId, ServerId, UserId} from '#src/dynamo/schema/common.ts';


export const equalField = S.equivalence(S.Struct({
    name  : S.String,
    value : S.String,
    inline: S.optional(S.Boolean),
}));


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


export type DApiEmbed = S.Schema.Type<typeof DiscordApiEmbed>;
export const equalDiscordApiEmbed = S.equivalence(DiscordApiEmbed);


export type DEmbed = S.Schema.Type<typeof DiscordEmbed>;
export type DEmbedKey = CompKey<DEmbed>;


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


export const encodeDiscordEmbed = S.encodeUnknown(DiscordEmbed);
export const decodeDiscordEmbed = S.decodeUnknown(DiscordEmbed);


