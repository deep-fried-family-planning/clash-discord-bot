export * as GSI1 from '#src/data/gsi1.ts';
export type GSI1 = typeof GSI1;
export * as GSI2 from '#src/data/gsi2.ts';
export type GSI2 = typeof GSI2;

export * as ServerPartition from '#src/data/pk-server/server.partition.ts';
export type ServerPartition = typeof ServerPartition;
export * as ServerClan from '#src/data/pk-server/server-clan.ts';
export type ServerClan = typeof ServerClan.Latest.Type;
export * as Server from '#src/data/pk-server/server.ts';
export type Server = typeof Server.Latest.Type;
export * as ServerInfo from '#src/data/pk-server/server-info.ts';
export type ServerInfo = typeof ServerInfo.Latest.Type;

export * as UserPartition from '#src/data/pk-user/user.partition.ts';
export type UserPartition = typeof UserPartition;
export * as UserPlayer from '#src/data/pk-user/user-player.ts';
export type UserPlayer = typeof UserPlayer.Latest.Type;
export * as User from '#src/data/pk-user/user.ts';
export type User = typeof User.Latest.Type;
export * as UserLink from '#src/data/pk-user/user-link.ts';
export type UserLink = typeof UserLink.Item.Type;

export * as UserRegistry from '#src/data/registry/user.registry.ts';
export type UserRegistry = typeof UserRegistry;
export * as ServerRegistry from '#src/data/registry/server.registry.ts';
export type ServerRegistry = typeof ServerRegistry;
export * as ServerClanRegistry from '#src/data/registry/server-clan.registry.ts';
export type ServerClanRegistry = typeof ServerClanRegistry;
export * as UserPlayerRegistry from '#src/data/registry/user-player.registry.ts';
export type UserPlayerRegistry = typeof UserPlayerRegistry;
