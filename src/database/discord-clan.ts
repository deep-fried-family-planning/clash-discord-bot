import {Schema as S} from 'effect';
import {ClanTag, ServerId, ThreadId} from '#src/database/common.ts';

export const DiscordClan = S.Struct({
    pk: ServerId,
    sk: ClanTag,

    type   : S.Literal('DiscordClan'),
    version: S.Literal('1.0.0'),
    created: S.Date,
    updated: S.Date,

    gsi_server_id: ServerId,
    gsi_clan_tag : ClanTag,

    thread_prep    : ThreadId,
    prep_opponent  : ClanTag,
    thread_battle  : ThreadId,
    battle_opponent: ClanTag,
    countdown      : ThreadId,
});
