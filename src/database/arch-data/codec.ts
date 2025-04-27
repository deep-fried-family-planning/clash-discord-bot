import {toStandard} from '#src/database/arch-data/standard.ts';
import * as AllianceData from '#src/database/arch-data/schema/alliance.ts';
import * as DiscordEmbedData from '#src/database/arch-data/schema/discord-embed.ts';
import * as InvocationData from '#src/database/arch-data/schema/invocation.ts';
import * as ServerClanData from '#src/database/arch-data/schema/server-clan.ts';
import * as ServerInfoData from '#src/database/arch-data/schema/server-info.ts';
import * as ServerData from '#src/database/arch-data/schema/server.ts';
import * as TransientData from '#src/database/arch-data/schema/transient.ts';
import * as UserData from '#src/database/arch-data/schema/user.ts';
import * as UserPlayerData from '#src/database/arch-data/schema/user-player.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Data, type ParseResult, pipe} from 'effect';

export const Alliance = toStandard(AllianceData);
export const DiscordEmbed = toStandard(DiscordEmbedData);
export const Invocation = toStandard(InvocationData);
export const Server = toStandard(ServerData);
export const ServerInfo = toStandard(ServerInfoData);
export const ServerClan = toStandard(ServerClanData);
export const Transient = toStandard(TransientData);
export const User = toStandard(UserData);
export const UserPlayer = toStandard(UserPlayerData);

export type Alliance = typeof Alliance._;
export type DiscordEmbed = typeof DiscordEmbed._;
export type Invocation = typeof Invocation._;
export type Server = typeof Server._;
export type ServerInfo = typeof ServerInfo._;
export type ServerClan = typeof ServerClan._;
export type Transient = typeof Transient._;
export type User = typeof User._;
export type UserPlayer = typeof UserPlayer._;

export const TagMap = {
  [Alliance._tag]    : Alliance,
  [DiscordEmbed._tag]: DiscordEmbed,
  [Invocation._tag]  : Invocation,
  [Server._tag]      : Server,
  [ServerInfo._tag]  : ServerInfo,
  [ServerClan._tag]  : ServerClan,
  [User._tag]        : User,
  [UserPlayer._tag]  : UserPlayer,
  [Transient._tag]   : Transient,
} as const;

export * as Codec from '#src/database/arch-data/codec.ts';
export type Codec = | typeof Alliance
                    | typeof DiscordEmbed
                    | typeof Invocation
                    | typeof Server
                    | typeof ServerInfo
                    | typeof ServerClan
                    | typeof User
                    | typeof UserPlayer
                    | typeof Transient;

export class DataDecodeError extends Data.TaggedError('deepfryer/DataDecodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export const decodeItem = (codec: Codec, enc: unknown) =>
  pipe(
    codec.decode(enc) as E.Effect<any, ParseResult.ParseError>,
    E.catchAll((e) =>
      new DataDecodeError({
        codec   : codec,
        original: enc,
        cause   : e,
      }),
    ),
  );

export class DataEncodeError extends Data.TaggedError('deepfryer/DataEncodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export const encodeItem = (codec: Codec, dec: unknown) =>
  pipe(
    codec.encode(dec) as E.Effect<any, ParseResult.ParseError>,
    E.map((encoded) => {
      const acc = {} as any;
      for (const k in Object.keys(encoded)) {
        if (encoded[k]) {
          acc[k] = encoded[k];
        }
      }
      return acc;
    }),
    E.catchAll((e) =>
      new DataEncodeError({
        codec   : codec,
        original: dec,
        cause   : e,
      }),
    ),
  );
