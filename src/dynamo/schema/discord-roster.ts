import {Schema as S} from 'effect';
import {ClanTag, RosterId, ServerId} from '#src/dynamo/schema/common.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export type DRoster = S.Schema.Type<typeof DiscordRoster>;
export type DRosterKey = CompKey<DRoster>;


export const DiscordRoster = S.Struct({
    type: S.Literal('DiscordRoster'),
    pk  : ServerId,
    sk  : RosterId,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    name       : S.String,
    description: S.String,
    clan       : S.optional(ClanTag),
    search_time: S.DateTimeUtc,
    roster_type: S.Enums({
        cwl            : 'cwl',
        cwlatlarge     : 'cwl-at-large',
        war            : 'war',
        waratlarge     : 'war-at-large',
        friendly       : 'friendly',
        friendlyatlarge: 'friendly-at-large',
    }),
});


export const decodeDiscordRoster = S.decodeUnknown(DiscordRoster);
export const encodeDiscordRoster = S.encodeUnknown(DiscordRoster);

