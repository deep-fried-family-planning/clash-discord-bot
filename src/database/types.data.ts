import type {Snowflake} from '@discordjs/core/http-only';

export type CocPlayerTag = string;
export type CocPlayerVerified = 1 | 0;

export type CocClanTag = string;
export type CocClanCategory = string;

export type DiscordServerId = Snowflake;
export type DiscordChannelId = Snowflake;
export type DiscordRoleId = Snowflake;
export type DiscordUserId = Snowflake;

export type OpinionatedConfigToggle = 1 | 0;

export type DDB_HashKey<T = string> = T;
export type DDB_ServerHashKey = DiscordServerId;
