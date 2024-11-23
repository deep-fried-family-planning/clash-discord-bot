import {S} from '#src/internal/pure/effect.ts';
import {InfoId, ServerId} from '#src/dynamo/common.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export type DInfo = S.Schema.Type<typeof DiscordInfo>;
export type DInfoKey = CompKey<DInfo>;


export const DiscordInfo = S.Struct({
    type: S.Literal('DiscordInfo'),

    pk: ServerId,
    sk: InfoId,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    kind: S.Enums({
        about: 'about',
        guide: 'guide',
        rule : 'rule',
    } as const),
    after: InfoId,
    name : S.String,
    desc : S.String,
    color: S.Number,
    image: S.optional(S.String),
});


export const encodeDiscordInfo = S.encodeUnknown(DiscordInfo);
export const decodeDiscordInfo = S.decodeUnknown(DiscordInfo);
