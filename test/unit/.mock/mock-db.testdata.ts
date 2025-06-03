import type {Server, Clan, User, Player} from '#src/data/index.ts';

export const TestDataUser = {
  _tag    : 'User',
  _v      : 0,
  _v7     : '00000000-0000-7000-8000-000000000000',
  _c      : '1970-01-01T00:00:00.000Z',
  pk      : 'user',
  sk      : '@',
  pk1     : 'user',
  sk1     : '@',
  timezone: 'America/Chicago',
  _u      : '1970-01-01T00:00:00.000Z',
  servers : [],
} as const satisfies typeof User.Latest.Encoded;

export const TestDataUser1 = {
  _tag    : 'User',
  _v      : 0,
  _v7     : '00000000-0000-7000-8000-000000000000',
  _c      : '1970-01-01T00:00:00.000Z',
  pk      : 'user1',
  sk      : '@',
  pk1     : 'user1',
  sk1     : '@',
  timezone: 'America/Chicago',
  _u      : '1970-01-01T00:00:00.000Z',
  servers : [],
} satisfies typeof User.Latest.Encoded;

export const TestDataUser2 = {
  _tag    : 'User',
  _v      : 0,
  _v7     : '00000000-0000-7000-8000-000000000000',
  _c      : '1970-01-01T00:00:00.000Z',
  pk      : 'user2',
  sk      : '@',
  pk1     : 'user2',
  sk1     : '@',
  timezone: 'America/Chicago',
  _u      : '1970-01-01T00:00:00.000Z',
  servers : [],
} satisfies typeof User.Latest.Encoded;

export const TestDataUserPlayer = {
  _tag        : 'Player',
  _v          : 0,
  _v7         : '00000000-0000-7000-8000-000000000000',
  account_type: 'main',
  _c          : '1970-01-01T00:00:00.000Z',
  name        : 'PlayerName',
  pk          : 'user2',
  pk2         : '#player',
  sk          : '#player',
  sk2         : 'user2',
  _u          : '1970-01-01T00:00:00.000Z',
  verification: 2,
} as const satisfies typeof Player.Latest.Encoded;

export const TestDataUserPlayer2 = {
  _tag        : 'Player',
  _v          : 0,
  _v7         : '00000000-0000-7000-8000-000000000000',
  account_type: 'main',
  _c          : '1970-01-01T00:00:00.000Z',
  name        : 'PlayerName',
  pk          : 'user2',
  pk2         : '#player',
  sk          : '#player',
  sk2         : 'user2',
  _u          : '1970-01-01T00:00:00.000Z',
  verification: 1,
} as const satisfies typeof Player.Latest.Encoded;

export const TestDataServer = {
  _tag : 'Server',
  _v   : 0,
  _v7  : '00000000-0000-7000-8000-000000000000',
  admin: 'admin',
  _c   : '1970-01-01T00:00:00.000Z',
  pk   : 'guild',
  pk1  : 'guild',
  sk   : '@',
  sk1  : '@',
  _u   : '1970-01-01T00:00:00.000Z',
} as const satisfies typeof Server.Latest.Encoded;

export const TestDataServerClanElderVerified = {
  _tag       : 'Clan',
  _v         : 0,
  _v7        : '00000000-0000-7000-8000-000000000000',
  countdown  : 'countdown',
  _c         : '1970-01-01T00:00:00.000Z',
  description: 'ClanDescription',
  name       : 'ClanName',
  pk         : 'guild2',
  sk         : '#c#clan',
  pk2        : '#clan#c',
  sk2        : 'guild2',
  select     : {
    label: 'ClanName',
    value: '#clan',
  },
  _u          : '1970-01-01T00:00:00.000Z',
  verification: 1,
} as const satisfies typeof Clan.Latest.Encoded;

export const TestDataServerClanLeaderVerified = {
  _tag        : 'Clan',
  _v          : 0,
  _v7         : '00000000-0000-7000-8000-000000000000',
  countdown   : 'countdown',
  _c          : '1970-01-01T00:00:00.000Z',
  description : 'ClanDescription',
  name        : 'ClanName',
  pk          : 'guild2',
  sk          : '#c#clan',
  pk2         : '#clan#c',
  sk2         : 'guild2',
  _u          : '1970-01-01T00:00:00.000Z',
  verification: 3,
  select      : {
    label: 'ClanName',
    value: '#clan',
  },
} as const satisfies typeof Clan.Latest.Encoded;
