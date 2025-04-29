import {declareCodec} from '#src/database/arch/arch.ts';
import * as AllianceData from '#src/database/data/alliance.ts';
import * as DiscordEmbedData from '#src/database/data/discord-embed.ts';
import * as ServerClanData from '#src/database/data/server-clan.ts';
import * as ServerInfoData from '#src/database/data/server-info.ts';
import * as ServerData from '#src/database/data/server.ts';
import * as TransientData from '#src/database/data/transient.ts';
import * as UserPlayerData from '#src/database/data/user-player.ts';
import * as UserData from '#src/database/data/user.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Data, type ParseResult, pipe} from 'effect';

export const Alliance = declareCodec(AllianceData);
export const DiscordEmbed = declareCodec(DiscordEmbedData);
export const Server = declareCodec(ServerData);
export const ServerInfo = declareCodec(ServerInfoData);
export const ServerClan = declareCodec(ServerClanData);
export const Transient = declareCodec(TransientData);
export const User = declareCodec(UserData);
export const UserPlayer = declareCodec(UserPlayerData);

export type Alliance = typeof Alliance._;
export type DiscordEmbed = typeof DiscordEmbed._;
export type Server = typeof Server._;
export type ServerInfo = typeof ServerInfo._;
export type ServerClan = typeof ServerClan._;
export type Transient = typeof Transient._;
export type User = typeof User._;
export type UserPlayer = typeof UserPlayer._;

export const TagMap = {
  [Alliance._tag]    : Alliance,
  [DiscordEmbed._tag]: DiscordEmbed,
  [Server._tag]      : Server,
  [ServerInfo._tag]  : ServerInfo,
  [ServerClan._tag]  : ServerClan,
  [User._tag]        : User,
  [UserPlayer._tag]  : UserPlayer,
  [Transient._tag]   : Transient,
} as const;

export * as Codec from '#src/database/arch/codec.ts';
export type Codec = | typeof Alliance
                    | typeof DiscordEmbed
                    | typeof Server
                    | typeof ServerInfo
                    | typeof ServerClan
                    | typeof User
                    | typeof UserPlayer
                    | typeof Transient;

export type Dec<A extends Codec> = A['_'];
export type Enc<A extends Codec> = A['_i'];

export class DataDecodeError extends Data.TaggedError('DataDecodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export class DataEncodeError extends Data.TaggedError('DataEncodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export const decodeItem = <A extends Codec>(codec: A, enc: unknown) =>
  pipe(
    codec.decode(enc) as E.Effect<Dec<A>, ParseResult.ParseError>,
    E.catchAll((e) =>
      new DataDecodeError({
        codec   : codec,
        original: enc,
        cause   : e,
      }),
    ),
  );

export const encodeItem = <A extends Codec>(codec: A, dec: unknown) =>
  pipe(
    codec.encode(dec) as E.Effect<Enc<A>, ParseResult.ParseError>,
    E.map((encoded) => {
      console.log('encoded', encoded);
      const enc = {...encoded} as any;
      const acc = {} as any;
      for (const k of Object.keys(encoded)) {
        if (enc[k] !== undefined) {
          acc[k] = enc[k];
        }
      }
      console.log('acc', acc);
      return acc as A['_i'];
    }),
    E.catchAll((e) =>
      new DataEncodeError({
        codec   : codec,
        original: dec,
        cause   : e,
      }),
    ),
  );
