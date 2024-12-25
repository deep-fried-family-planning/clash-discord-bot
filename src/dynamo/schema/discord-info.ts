import type {CompKey} from '#src/dynamo/dynamo.ts';
import {EmbedId, InfoId, ServerId} from '#src/dynamo/schema/common.ts';
import {S} from '#src/internal/pure/effect.ts';


export type DInfo = S.Schema.Type<typeof DiscordInfo>;
export type DInfoKey = CompKey<DInfo>;


export const DiscordInfo = S.Struct({
    type: S.Literal('DiscordInfo'),

    pk: ServerId,
    sk: InfoId,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    embed_id      : S.optional(EmbedId),
    selector_label: S.optional(S.String),
    selector_desc : S.optional(S.String),
    selector_order: S.optional(S.Number),

    kind: S.Enums({
        omni : 'omni',
        about: 'about',
        guide: 'guide',
        rule : 'rule',
    } as const),


    after: S.optional(S.String),
    name : S.optional(S.String),
    desc : S.optional(S.String),
    color: S.optional(S.Number),
    image: S.optional(S.String),
});


export const encodeDiscordInfo = S.encodeUnknown(DiscordInfo);
export const decodeDiscordInfo = S.decodeUnknown(DiscordInfo);
