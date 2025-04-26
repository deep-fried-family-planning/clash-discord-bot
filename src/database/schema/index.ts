import * as AllianceData from '#src/database/schema/alliance-now.ts';
import * as DiscordEmbedData from '#src/database/schema/discord-embed.ts';
import * as ServerClanData from '#src/database/schema/server-clan.ts';
import * as ServerInfoData from '#src/database/schema/server-info.ts';
import * as ServerData from '#src/database/schema/server-now.ts';
import * as UserData from '#src/database/schema/user-now.ts';
import * as UserPlayerData from '#src/database/schema/user-player.ts';
import {toStandard} from '#src/database/arch-schema/arch.ts';

export const Alliance = toStandard(AllianceData);
export const DiscordEmbed = toStandard(DiscordEmbedData);
export const Server = toStandard(ServerData);
export const ServerInfo = toStandard(ServerInfoData);
export const ServerClan = toStandard(ServerClanData);
export const User = toStandard(UserData);
export const UserPlayer = toStandard(UserPlayerData);

export type Alliance = typeof Alliance.Type;
export type DiscordEmbed = typeof DiscordEmbed.Type;
export type Server = typeof Server.Type;
export type ServerInfo = typeof ServerInfo.Type;
export type ServerClan = typeof ServerClan.Type;
export type User = typeof User.Type;
export type UserPlayer = typeof UserPlayer.Type;

export const TagMap = {
  [Alliance.Key.tag]    : Alliance,
  [DiscordEmbed.Key.tag]: DiscordEmbed,
  [Server.Key.tag]      : Server,
  [ServerInfo.Key.tag]  : ServerInfo,
  [ServerClan.Key.tag]  : ServerClan,
  [User.Key.tag]        : User,
  [UserPlayer.Key.tag]  : UserPlayer,
} as const;

export type Any =
  | typeof Alliance
  | typeof DiscordEmbed
  | typeof Server
  | typeof ServerInfo
  | typeof ServerClan
  | typeof User
  | typeof UserPlayer;
