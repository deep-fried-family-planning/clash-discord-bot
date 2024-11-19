import {Schema as S} from 'effect';
import {ClanTag, PlayerTag, RosterId, ServerId} from '#src/dynamo/common.ts';


export type DRosterSignup = S.Schema.Type<typeof DiscordRosterSignup>;


export const DiscordRosterSignup = S.Struct({
    type         : S.Literal('DiscordRosterSignup'),
    pk           : RosterId,
    sk           : PlayerTag,
    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,
    version      : S.Literal('1.0.0'),
    created      : S.Date,
    updated      : S.Date,
});
