import {S} from '#src/utils/effect.ts';

export const ServerId = S.String.pipe(S.startsWith('server-'));
export const UserId = S.String.pipe(S.startsWith('user-'));
export const NowId = S.Literal('now');
export const ChannelId = S.String;
export const RoleId = S.String;
export const ThreadId = S.String;
export const MessageId = S.String;

export const ClanTag = S.String.pipe(S.startsWith('clan-'));
export const PlayerTag = S.String.pipe(S.startsWith('player-'));

export const ServerIdEncode = S.encodeUnknown(ServerId);
export const UserIdEncode = S.encodeUnknown(UserId);
export const ClanTagEncode = S.encodeUnknown(ClanTag);
export const PlayerTagEncode = S.encodeUnknown(PlayerTag);
