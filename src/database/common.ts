import {S} from '#src/internals/re-exports/effect.ts';

export const ServerId = S.String.pipe(S.startsWith('s-'));
export const UserId = S.String.pipe(S.startsWith('u-'));
export const NowId = S.Literal('now');
export const ChannelId = S.String;
export const RoleId = S.String;
export const ThreadId = S.String;
export const MessageId = S.String;

export const ClanTag = S.String.pipe(S.startsWith('c-'));
export const PlayerTag = S.String.pipe(S.startsWith('p-'));

export const ServerIdEncode = S.encodeUnknown(ServerId);
export const UserIdEncode = S.encodeUnknown(UserId);
export const ClanTagEncode = S.encodeUnknown(ClanTag);
export const PlayerTagEncode = S.encodeUnknown(PlayerTag);
