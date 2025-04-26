import {toStandard} from '#src/database/setup/arch.ts';
import * as AllianceData from '#src/database/schema/alliance-now.ts';
import * as DiscordEmbedData from '#src/database/schema/discord-embed.ts';
import * as ServerClanData from '#src/database/schema/server-clan.ts';
import * as ServerInfoData from '#src/database/schema/server-info.ts';
import * as ServerData from '#src/database/schema/server-now.ts';
import * as UserData from '#src/database/schema/user-now.ts';
import * as UserPlayerData from '#src/database/schema/user-player.ts';

export * as DatabaseSchema from './index.ts';
export type DatabaseSchema = never;

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
