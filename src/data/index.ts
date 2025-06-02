export * as GSI1 from '#src/data/gsi/gsi1.ts';
export type GSI1 = typeof GSI1;
export * as GSI2 from '#src/data/gsi/gsi2.ts';
export type GSI2 = typeof GSI2;

export * as ServerPartition from '#src/data/partition-server/server.partition.ts';
export type ServerPartition = typeof ServerPartition;
export * as Clan from '#src/data/partition-server/clan.ts';
export type Clan = typeof Clan.Latest.Type;
export * as Server from '#src/data/partition-server/server.ts';
export type Server = typeof Server.Latest.Type;
export * as Info from '#src/data/partition-server/info.ts';
export type Info = typeof Info.Latest.Type;

export * as UserPartition from '#src/data/partition-user/user.partition.ts';
export type UserPartition = typeof UserPartition;
export * as Player from '#src/data/partition-user/player.ts';
export type Player = typeof Player.Latest.Type;
export * as User from '#src/data/partition-user/user.ts';
export type User = typeof User.Latest.Type;
export * as Link from '#src/data/partition-user/link.ts';
export type Link = typeof Link.Item.Type;

export * as Registry from '#src/data/registry.ts';
export type Registry = typeof Registry;
