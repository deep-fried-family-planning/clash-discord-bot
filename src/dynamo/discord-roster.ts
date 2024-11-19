import {Schema as S} from 'effect';
import {ClanTag, RosterId, ServerId} from '#src/dynamo/common.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';


export type DRoster = S.Schema.Type<typeof DiscordRoster>;
export type DRosterKey = CompKey<DRoster>;


export const DiscordRoster = S.Struct({
    type         : S.Literal('DiscordRoster'),
    pk           : ServerId,
    sk           : RosterId,
    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,
    version      : S.Literal('1.0.0'),
    created      : S.Date,
    updated      : S.Date,
    clan         : ClanTag,
    roster_type  : S.Enums({
        cwl     : 'cwl',
        war     : 'war',
        friendly: 'friendly',
    }),
});


