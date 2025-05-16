import * as S from 'effect/Schema';

export const PrependedId = (start: string) =>
  S.transform(
    S.String.pipe(S.startsWith(start)),
    S.String,
    {
      decode: (s) => s.slice(start.length),
      encode: (s) => `${start}${s}`,
    },
  );

export const AppendedId = (end: string) =>
  S.transform(
    S.String.pipe(S.endsWith(end)),
    S.String,
    {
      decode: (s) => s.slice(0, -end.length),
      encode: (s) => `${s}${end}`,
    },
  );

export const Prepended = <A, R>(start: string, id: S.Schema<A, string, R>) =>
  S.transform(
    S.String.pipe(S.startsWith(start)),
    id,
    {
      decode: (s) => s.slice(start.length),
      encode: (s) => `${start}${s}`,
    },
  );

export const Appended = <A, R>(id: S.Schema<A, string, R>, end: string) =>
  S.transform(
    S.String.pipe(S.endsWith(end)),
    id,
    {
      decode: (s) => s.slice(0, -end.length),
      encode: (s) => `${s}${end}`,
    },
  );

export const PartitionRoot = S.tag('@');

export const ClashTag = S.String.pipe(S.startsWith('#'));

export const ClanTag = ClashTag;
export const ClanTagPk = AppendedId('#c');
export const ClanTagSk = PrependedId('#c');

export const PlayerTag = ClashTag;
export const PlayerTagPk = AppendedId('#p');
export const PlayerTagSk = PrependedId('#p');

export const ServerId = S.String;
export const ServerIdPk = ServerId;
export const ServerIdSk = PrependedId('s#');

export const UserId = S.String;
export const UserIdPk = UserId;
export const UserIdSk = PrependedId('u#');


export const ThreadId = S.String;
export const RoleId = S.String;
export const MessageId = S.String;
export const ChannelId = S.String;
export const InfoId = PrependedId('i-');
export const EmbedId = PrependedId('e-');
export const NowSk = S.Literal('now');
export const NowTag = S.tag('now');
