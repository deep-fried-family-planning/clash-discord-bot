import * as S from 'effect/Schema';

const PrependedId = (start: string) =>
  S.transform(
    S.String.pipe(S.startsWith(start)),
    S.String,
    {
      decode: (s) => s.slice(start.length),
      encode: (s) => start.concat(s),
    },
  );

export const ClanTag = PrependedId('c-');
export const PlayerTag = PrependedId('p-');
export const ServerId = PrependedId('s-');
export const UserId = PrependedId('u-');
export const ThreadId = S.String;
export const RoleId = S.String;
export const MessageId = S.String;
export const ChannelId = S.String;
export const InfoId = PrependedId('i-');
export const EmbedId = PrependedId('e-');
export const NowSk = S.Literal('now');
