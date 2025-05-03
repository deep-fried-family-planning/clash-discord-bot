import {S} from '#src/internal/pure/effect.ts';

 const KeyCodec = (start: string) =>
  ({
    Forward: S.transform(
      S.String.pipe(S.startsWith(start)),
      S.String,
      {
        decode: (s) => s.slice(start.length),
        encode: (s) => start.concat(s),
      },
    ),
    Reverse: S.transform(
      S.String,
      S.String.pipe(S.startsWith(start)),
      {
        decode: (s) => s.slice(start.length),
        encode: (s) => start.concat(s),
      },
    ),
  });

export const ClanTag = KeyCodec('c-');
export const PlayerTag = KeyCodec('p-');
export const ServerId = KeyCodec('s-');
export const UserId = KeyCodec('u-');
export const ThreadId = S.String;
export const RoleId = S.String;
export const ChannelId = S.String;
export const AllianceId = KeyCodec('a-');
export const InfoId = KeyCodec('i-');
export const EmbedId = KeyCodec('e-');
export const NowSk = S.Literal('now');
export const ConfigSk = S.Literal('config');
export const TransientUrl = S.String.pipe(S.length({min: 1, max: 2000}));
export const ComputeName = S.String;
export const DateTimeSk = S.DateTimeUtc;
