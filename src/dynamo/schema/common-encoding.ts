import {AllianceId, ClanTag, EmbedId, InfoId, PlayerTag, RosterId, ServerId, ServerUserRefId, UserId} from '#src/dynamo/schema/common.ts';
import {S} from '#src/internal/pure/effect.ts';



export const encodeServerId         = S.encodeUnknown(ServerId);
export const encodeUserId           = S.encodeUnknown(UserId);
export const encodeClanTag          = S.encodeUnknown(ClanTag);
export const encodePlayerTag        = S.encodeUnknown(PlayerTag);
export const encodeRosterId         = S.encodeUnknown(RosterId);
export const encodeInfoId           = S.encodeUnknown(InfoId);
export const encodeEmbedId          = S.encodeUnknown(EmbedId);
export const encodeServerRefId      = S.encodeUnknown(ServerUserRefId);
export const encodeAllianceServerId = S.encodeUnknown(AllianceId);
