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

export const PartitionRoot = S.tag('@');

export const ClanTag = AppendedId('.c');
export const PlayerTag = AppendedId('.p');
export const ServerId = S.String;
export const ServerInfoId = AppendedId('.i');
export const UserId = S.String;
export const ThreadId = S.String;
export const RoleId = S.String;
export const MessageId = S.String;
export const ChannelId = S.String;
export const InfoId = PrependedId('i-');
export const EmbedId = PrependedId('e-');
export const NowSk = S.Literal('now');
export const NowTag = S.tag('now');
