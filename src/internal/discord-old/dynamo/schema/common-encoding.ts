import {EmbedId, InfoId, RosterId, ServerId, UserId} from '#src/internal/discord-old/dynamo/schema/common.ts';
import {S} from '#src/internal/pure/effect.ts';

export const encodeServerId = S.encodeUnknown(ServerId);
export const encodeUserId = S.encodeUnknown(UserId);
export const encodeRosterId = S.encodeUnknown(RosterId);
export const encodeInfoId = S.encodeUnknown(InfoId);
export const encodeEmbedId = S.encodeUnknown(EmbedId);
