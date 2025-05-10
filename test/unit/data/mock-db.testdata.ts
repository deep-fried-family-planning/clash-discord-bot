import {DataTag} from '#src/data/constants/index.ts';
import type {User, UserPlayer, Server} from '#src/data/index.ts';
import * as DateTime from 'effect/DateTime';

export const TestDataUser = {
  _tag           : DataTag.USER,
  pk             : 'u-user',
  sk             : 'now',
  version        : 0,
  created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  gsi_all_user_id: 'u-user',
  timezone       : 'America/New_York',
} as const satisfies User.Encoded;

export const TestDataUser1 = {
  _tag           : DataTag.USER,
  pk             : 'u-user1',
  sk             : 'now',
  version        : 0,
  created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  gsi_all_user_id: 'u-user1',
  timezone       : 'America/New_York',
} satisfies User.Encoded;

export const TestDataUser2 = {
  _tag           : DataTag.USER,
  pk             : 'u-user2',
  sk             : 'now',
  version        : 0,
  created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
  gsi_all_user_id: 'u-user2',
  timezone       : 'America/New_York',
} satisfies User.Encoded;

export const TestDataUserPlayer = {
  _tag          : 'UserPlayer',
  account_type  : 'main',
  created       : '1970-01-01T00:00:00.000Z',
  gsi_player_tag: 'p-player',
  gsi_user_id   : 'u-user2',
  name          : 'PlayerName',
  pk            : 'u-user2',
  sk            : 'p-player',
  updated       : '1970-01-01T00:00:00.000Z',
  verification  : 2,
  version       : 0,
} as const satisfies UserPlayer.Encoded;

export const TestDataUserPlayer2 = {
  _tag          : 'UserPlayer',
  account_type  : 'main',
  created       : '1970-01-01T00:00:00.000Z',
  gsi_player_tag: 'p-player',
  gsi_user_id   : 'u-user2',
  name          : 'PlayerName',
  pk            : 'u-user2',
  sk            : 'p-player',
  updated       : '1970-01-01T00:00:00.000Z',
  verification  : 1,
  version       : 0,
} as const satisfies UserPlayer.Encoded;

export const TestDataServer = {
  _tag             : 'Server',
  admin            : 'admin',
  created          : '1970-01-01T00:00:00.000Z',
  gsi_all_server_id: 's-guild',
  pk               : 's-guild',
  sk               : 'now',
  updated          : '1970-01-01T00:00:00.000Z',
  version          : 0,
} as const satisfies Server.Encoded;
