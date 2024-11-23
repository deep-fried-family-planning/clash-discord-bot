import {S} from '#src/internal/pure/effect.ts';
import {ClanTag, InfoId, ServerId} from '#src/dynamo/common.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export type DInfo = S.Schema.Type<typeof DiscordInfo>;
export type DInfoKey = CompKey<DInfo>;


export const DiscordInfo = S.Struct({
    type: S.Literal('DiscordClan'),

    pk: ServerId,
    sk: InfoId,

    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    kind: S.Enums({
        about: 'about',
        guide: 'guide',
        rule : 'rule',
    }),
    name : S.String.pipe(S.optionalWith({default: () => ''})),
    desc : S.String.pipe(S.optionalWith({default: () => ''})),
    image: S.optional(S.String),
});


export const encodeDiscordInfo = S.encodeUnknown(DiscordInfo);
export const decodeDiscordInfo = S.decodeUnknown(DiscordInfo);
