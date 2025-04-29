import {S} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';

const asPrependedId = (start: string) =>
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

export * as Id from '#src/database/arch/id.ts';
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
