import * as S from 'effect/Schema';
import * as Document from './Document.ts';

export const NowSk = S.Literal('now');
export const NowTag = S.tag('now');



export const PartitionRoot = S.tag('.');

const Snowflake = S.String;
export const ServerId = Snowflake;
export const ServerIdSk = Document.PrependedSortKey(ServerId, 's-');
export const UserId = Snowflake;
export const UserIdSk = Document.PrependedSortKey(UserId, 'u-');
export const ThreadId = Snowflake;
export const RoleId = Snowflake;
export const MessageId = Snowflake;
export const ChannelId = Snowflake;

const ClashTag = S.String.pipe(S.startsWith('#'));
export const ClanTag = ClashTag;
export const ClanTagPk = Document.AppendedPartitionKey(ClanTag, '-c');
export const ClanTagSk = Document.PrependedSortKey(ClanTag, 'c-');
export const PlayerTag = ClashTag;
export const PlayerTagPk = Document.AppendedPartitionKey(PlayerTag, '-p');
export const PlayerTagSk = Document.PrependedSortKey(PlayerTag, 'p-');

export const AllianceId = S.ULID;
export const AllianceIdPk = Document.AppendedPartitionKey(AllianceId, '.a');
export const AllianceIdSk = Document.PrependedSortKey(AllianceId, 'a.');
export const EmbedId = S.UUID;
export const EmbedIdPk = Document.AppendedPartitionKey(EmbedId, '.e');
export const EmbedIdSk = Document.PrependedSortKey(EmbedId, 'e.');
export const InfoId = S.UUID;
export const InfoIdPk = Document.AppendedPartitionKey(InfoId, '.i');
export const InfoIdSk = Document.PrependedSortKey(InfoId, 'i.');
