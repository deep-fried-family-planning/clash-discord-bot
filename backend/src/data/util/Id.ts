import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const PartitionRoot = S.tag('@');

export const ClashTag    = S.String.pipe(S.startsWith('#')),
             ClanTag     = ClashTag,
             ClanTagPk   = Table.AppendedId('#c'),
             ClanTagSk   = Table.PrependedId('#c'),
             PlayerTag   = ClashTag,
             PlayerTagPk = Table.AppendedId('#p'),
             PlayerTagSk = Table.PrependedId('#p');

export const ServerId   = S.String,
             ServerIdPk = ServerId,
             ServerIdSk = Table.PrependedId('s#'),
             UserId     = S.String,
             UserIdPk   = UserId,
             UserIdSk   = Table.PrependedId('u#'),
             ThreadId   = S.String,
             RoleId     = S.String,
             MessageId  = S.String,
             ChannelId  = S.String;

export const InfoId  = Table.PrependedId('i-'),
             EmbedId = Table.PrependedId('e-'),
             NowSk   = S.Literal('now'),
             NowTag  = S.tag('now');
