import {StartsWithId} from '#src/dynamo/schema/common-utils.ts';
import {S} from '#src/internal/pure/effect.ts';


export const NowId = S.Literal('now');

export const ServerId = StartsWithId('s-', 'ServerId');
export const UserId = StartsWithId('u-', 'UserId');
export const ChannelId = S.String;
export const RoleId = S.String;
export const ThreadId = S.String;
export const MessageId = S.String;
export const ForumTagId = S.String;

export const ClanTag = StartsWithId('c-', 'ClanTag');
export const PlayerTag = StartsWithId('p-', 'PlayerTag');

export const RosterId = StartsWithId('r-', 'RosterId');
export const InfoId = StartsWithId('i-', 'InfoId');
export const EmbedId = StartsWithId('e-', 'InfoId');
export const AllianceId = StartsWithId('a-', 'AllianceId');
export const ServerUserRefId = StartsWithId('sur-', 'ServerRefId');
