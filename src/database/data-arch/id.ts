import {asPrependedId} from '#src/database/data-arch/codec-standard.ts';
import {S} from '#src/internal/pure/effect.ts';

export const ClanTag = asPrependedId('c-');
export const PlayerTag = asPrependedId('p-');

export const ServerId = asPrependedId('s-');
export const UserId = asPrependedId('u-');
export const ThreadId = S.String;
export const RoleId = S.String;
export const ChannelId = S.String;

export const AllianceId = asPrependedId('a-');
export const InfoId = asPrependedId('i-');
export const EmbedId = asPrependedId('e-');
export const NowSk = S.Literal('now');

export const TransientUrl = S.String.pipe(S.length({min: 1, max: 2000}));
export const ComputeName = S.String;
export const DateTimeSk = S.DateTimeUtc;

export * as Id from '#src/database/data-arch/id.ts';
export type Id = | typeof ClanTag
                 | typeof PlayerTag
                 | typeof ServerId
                 | typeof UserId
                 | typeof ThreadId
                 | typeof RoleId
                 | typeof ChannelId
                 | typeof AllianceId
                 | typeof InfoId
                 | typeof EmbedId
                 | typeof NowSk
                 | typeof TransientUrl
                 | typeof ComputeName
                 | typeof DateTimeSk;
