import {S} from '#src/internal/pure/effect.ts';
import {decodeUnknownSync} from 'effect/Schema';

export const playerJoinLeave = S.Struct({
  type     : S.String,
  clan     : S.String,
  time     : S.DateTimeUtc,
  tag      : S.String,
  name     : S.String,
  th       : S.Int,
  clan_name: S.String,
});


const decoder = decodeUnknownSync(playerJoinLeave);

console.log(decoder({
  type     : 'join',
  clan     : '#2YVCYUCCP',
  time     : '2025-05-02T02:04:37.283000',
  tag      : '#Y82Q9Q98',
  name     : 'Kronith',
  th       : 17,
  clan_name: 'ClashTest Dummy',
}));
