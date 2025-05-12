import {DataTag} from '#src/data/constants/index.ts';
import type {Server, ServerClan, User, UserPlayer} from '#src/data/index.ts';
import * as DateTime from 'effect/DateTime';

export const TestDataUser = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'u-user',
  pkp     : 'u-user',
  sk      : 'now',
  skp     : '.',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
} as const satisfies User.Encoded;

export const TestDataUser1 = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'u-user1',
  pkp     : 'u-user1',
  sk      : 'now',
  skp     : '.',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
} satisfies User.Encoded;

export const TestDataUser2 = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'u-user2',
  pkp     : 'u-user2',
  sk      : 'now',
  skp     : '.',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
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
  _tag   : 'Server',
  _v     : 1,
  _v7    : '00000000-0000-7000-8000-000000000000',
  admin  : 'admin',
  created: '1970-01-01T00:00:00.000Z',
  pk     : 's-guild',
  pkp    : 's-guild',
  sk     : 'now',
  skp    : '.',
  updated: '1970-01-01T00:00:00.000Z',
} as const satisfies Server.Encoded;

export const TestDataServerClan = {
  _tag         : 'ServerClan',
  countdown    : 'countdown',
  description  : 'ClanDescription',
  gsi_clan_tag : 'c-clan',
  gsi_server_id: 's-guild',
  name         : 'ClanName',
  pk           : 's-guild',
  select       : {
    label: 'ClanName',
    value: 'c-clan',
  },
  sk          : 'c-clan',
  verification: 0,
  version     : 0,
} as const satisfies ServerClan.Encoded;

export const TestDataServerClanElderVerified = {
  _tag         : 'ServerClan',
  countdown    : 'countdown',
  description  : 'ClanDescription',
  gsi_clan_tag : 'c-clan',
  gsi_server_id: 's-guild',
  name         : 'ClanName',
  pk           : 's-guild2',
  select       : {
    label: 'ClanName',
    value: 'c-clan',
  },
  sk          : 'c-clan',
  verification: 1,
  version     : 0,
} as const satisfies ServerClan.Encoded;

export const TestDataServerClanLeaderVerified = {
  _tag         : 'ServerClan',
  countdown    : 'countdown',
  description  : 'ClanDescription',
  gsi_clan_tag : 'c-clan',
  gsi_server_id: 's-guild',
  name         : 'ClanName',
  pk           : 's-guild2',
  select       : {
    label: 'ClanName',
    value: 'c-clan',
  },
  sk          : 'c-clan',
  verification: 3,
  version     : 0,
} as const satisfies ServerClan.Encoded;
