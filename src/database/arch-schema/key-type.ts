import {S} from '#src/internal/pure/effect.ts';
import {prependKey} from '#src/database/arch-schema/arch.ts';

export const ClanTag = prependKey('c-');
export const PlayerTag = prependKey('p-');
export const ServerId = prependKey('s-');
export const UserId = prependKey('u-');
export const ThreadId = S.String;
export const RoleId = S.String;
export const ChannelId = S.String;
export const AllianceId = prependKey('a-');
export const InfoId = prependKey('i-');
export const EmbedId = prependKey('e-');
export const NowSk = S.Literal('now');
