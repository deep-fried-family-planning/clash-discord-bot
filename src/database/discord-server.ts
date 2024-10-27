import {Schema as S} from 'effect';
import {ChannelId, RoleId, ServerId} from '#src/database/common.ts';

export const DiscordServer = S.Struct({
    pk: ServerId,
    sk: S.Literal('now'),

    type   : S.Literal('DiscordServer'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_server_id: ServerId,

    polling: S.Boolean,

    announcements: S.optional(ChannelId),
    info         : S.optional(ChannelId),
    general      : S.optional(ChannelId),
    slash        : S.optional(ChannelId),
    staff        : S.optional(ChannelId),
    forum        : S.optional(ChannelId),
    errors       : S.optional(ChannelId),

    admin : RoleId,
    member: S.optional(RoleId),
    guest : S.optional(RoleId),
});
