import {pipe, S} from '#src/internal/pure/effect.ts';

const prepends = (start: string) =>
  pipe(
    S.String,
    S.startsWith(start),
    S.transform(
      S.String,
      {
        decode: (s) => s.slice(start.length),
        encode: (s) => start.concat(s),
      },
    ),
    S.transform(
      S.String,
      {
        decode: (s) => {
          if (s.startsWith(start)) {
            throw new Error();
          }
          return s;
        },
        encode: (s) => {
          if (s.startsWith(start)) {
            throw new Error();
          }
          return s;
        },
      },
    ),
  );

export const ClanTag = prepends('c-');
export const PlayerTag = prepends('p-');

export const ServerId = prepends('s-');
export const UserId = prepends('u-');
export const ThreadId = S.String;
export const RoleId = S.String;
export const ChannelId = S.String;

export const AllianceId = prepends('a-');
export const InfoId = prepends('i-');
export const EmbedId = prepends('e-');
export const NowSk = S.Literal('now');
