export * as GSI1 from '#src/data/gsi/gsi1.ts';
export type GSI1 = typeof GSI1;
export * as GSI2 from '#src/data/gsi/gsi2.ts';
export type GSI2 = typeof GSI2;

export * as ServerPartition from '#src/data/server/server.partition.ts';
export type ServerPartition = typeof ServerPartition;
export * as Clan from '#src/data/server/clan.ts';
export type Clan = typeof Clan.Latest.Type;
export * as Server from '#src/data/server/server.ts';
export type Server = typeof Server.Latest.Type;
export * as Info from '#src/data/server/info.ts';
export type Info = typeof Info.Latest.Type;

export * as UserPartition from '#src/data/user/user.partition.ts';
export type UserPartition = typeof UserPartition;
export * as Player from '#src/data/user/player.ts';
export type Player = typeof Player.Latest.Type;
export * as User from '#src/data/user/user.ts';
export type User = typeof User.Latest.Type;
export * as Link from '#src/data/user/link.ts';
export type Link = typeof Link.Item.Type;

export * as UserRegistry from '#src/data-registry/user-registry.ts';
export type UserRegistry = typeof UserRegistry;
export * as ServerRegistry from '#src/data-registry/server-registry.ts';
export type ServerRegistry = typeof ServerRegistry;
export * as ServerClanRegistry from '#src/data-registry/clan-registry.ts';
export type ServerClanRegistry = typeof ServerClanRegistry;
export * as UserPlayerRegistry from '#src/data-registry/player-registry.ts';
export type UserPlayerRegistry = typeof UserPlayerRegistry;
