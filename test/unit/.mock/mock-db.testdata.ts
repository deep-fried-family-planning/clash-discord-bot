import type {Server, ServerClan, User, UserPlayer} from '#src/data/index.ts';

export const TestDataUser = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'user',
  sk      : '@',
  pk1     : 'user',
  sk1     : '@',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
  servers : [],
} as const satisfies typeof User.Latest.Encoded;

export const TestDataUser1 = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'user1',
  sk      : '@',
  pk1     : 'user1',
  sk1     : '@',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
  servers : [],
} satisfies typeof User.Latest.Encoded;

export const TestDataUser2 = {
  _tag    : 'User',
  _v      : 1,
  _v7     : '00000000-0000-7000-8000-000000000000',
  created : '1970-01-01T00:00:00.000Z',
  pk      : 'user2',
  sk      : '@',
  pk1     : 'user2',
  sk1     : '@',
  timezone: 'America/Chicago',
  updated : '1970-01-01T00:00:00.000Z',
  servers : [],
} satisfies typeof User.Latest.Encoded;

export const TestDataUserPlayer = {
  _tag        : 'UserPlayer',
  _v          : 1,
  _v7         : '00000000-0000-7000-8000-000000000000',
  account_type: 'main',
  created     : '1970-01-01T00:00:00.000Z',
  name        : 'PlayerName',
  pk          : 'user2',
  pk2         : '#player',
  sk          : '#player',
  sk2         : 'user2',
  updated     : '1970-01-01T00:00:00.000Z',
  verification: 2,
} as const satisfies UserPlayer.Encoded;

export const TestDataUserPlayer2 = {
  _tag        : 'UserPlayer',
  _v          : 1,
  _v7         : '00000000-0000-7000-8000-000000000000',
  account_type: 'main',
  created     : '1970-01-01T00:00:00.000Z',
  name        : 'PlayerName',
  pk          : 'user2',
  pk2         : '#player',
  sk          : '#player',
  sk2         : 'user2',
  updated     : '1970-01-01T00:00:00.000Z',
  verification: 1,
} as const satisfies UserPlayer.Encoded;

export const TestDataServer = {
  _tag   : 'Server',
  _v     : 1,
  _v7    : '00000000-0000-7000-8000-000000000000',
  admin  : 'admin',
  created: '1970-01-01T00:00:00.000Z',
  pk     : 'guild',
  pk1    : 'guild',
  sk     : '@',
  sk1    : '@',
  updated: '1970-01-01T00:00:00.000Z',
} as const satisfies Server.Encoded;

export const TestDataServerClanElderVerified = {
  _tag       : 'ServerClan',
  _v         : 1,
  _v7        : '00000000-0000-7000-8000-000000000000',
  countdown  : 'countdown',
  created    : '1970-01-01T00:00:00.000Z',
  description: 'ClanDescription',
  name       : 'ClanName',
  pk         : 'guild2',
  sk         : '#clan',
  pk2        : '#clan',
  sk2        : 'guild2',
  select     : {
    label: 'ClanName',
    value: '#clan',
  },
  updated     : '1970-01-01T00:00:00.000Z',
  verification: 1,
} as const satisfies ServerClan.Encoded;

export const TestDataServerClanLeaderVerified = {
  _tag        : 'ServerClan',
  _v          : 1,
  _v7         : '00000000-0000-7000-8000-000000000000',
  countdown   : 'countdown',
  created     : '1970-01-01T00:00:00.000Z',
  description : 'ClanDescription',
  name        : 'ClanName',
  pk          : 'guild2',
  sk          : '#clan',
  pk2         : '#clan',
  sk2         : 'guild2',
  updated     : '1970-01-01T00:00:00.000Z',
  verification: 3,
  select      : {
    label: 'ClanName',
    value: 'c-clan',
  },
} as const satisfies ServerClan.Encoded;
