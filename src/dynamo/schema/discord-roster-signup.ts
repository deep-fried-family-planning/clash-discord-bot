import {Schema as S} from 'effect';
import {RosterId, UserId} from '#src/dynamo/schema/common.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export type DRosterSignup = S.Schema.Type<typeof DiscordRosterSignup>;
export type DRosterSignupKey = CompKey<DRosterSignup>;


export const DiscordRosterSignup = S.Struct({
    type: S.Literal('DiscordRosterSignup'),
    pk  : RosterId,
    sk  : UserId,

    gsi_user_id  : UserId,
    gsi_roster_id: RosterId,

    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    accounts: S.Record({
        key  : S.String,
        value: S.Array(S.Struct({
            availability: S.Boolean,
            designation : S.optional(S.Enums({
                default: 'default',
                dts    : 'dts', // designated 2 star
            })),
        })).pipe(
            S.maxItems(7),
        ),
    }),
});


export const encodeDiscordRosterSignup = S.encodeUnknown(DiscordRosterSignup);
export const decodeDiscordRosterSignup = S.decodeUnknown(DiscordRosterSignup);
