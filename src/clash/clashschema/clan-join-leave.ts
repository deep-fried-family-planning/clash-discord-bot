import {S} from '#src/internal/pure/effect.ts';
import {decodeUnknownSync} from 'effect/Schema';

export const players = S.Struct({
  name: S.String, // pk?
  tag : S.String, // sk?

  th  : S.Int,
  time: S.DateTimeUtc,
  clan: S.String,
  type: S.String,
});

const decoder = decodeUnknownSync(players);
console.log(decoder({
  name: 'Jymer',
  tag : '#8UGUPYUV9',
  th  : 17,
  time: '2025-05-01T16:40:25.385000',
  clan: '#2GR2G0PGG',
  type: 'leave',
}));
