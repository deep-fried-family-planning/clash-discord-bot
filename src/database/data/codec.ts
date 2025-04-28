import * as AllianceData from '#src/database/data/schema/alliance.ts';
import * as DiscordEmbedData from '#src/database/data/schema/discord-embed.ts';
import * as InvocationData from '#src/database/data/schema/invocation.ts';
import * as ServerClanData from '#src/database/data/schema/server-clan.ts';
import * as ServerInfoData from '#src/database/data/schema/server-info.ts';
import * as ServerData from '#src/database/data/schema/server.ts';
import * as TransientData from '#src/database/data/schema/transient.ts';
import * as UserPlayerData from '#src/database/data/schema/user-player.ts';
import * as UserData from '#src/database/data/schema/user.ts';
import {declareCodec} from '#src/database/data/arch.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Data, type ParseResult, pipe} from 'effect';

export class DataDecodeError extends Data.TaggedError('deepfryer/DataDecodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export class DataEncodeError extends Data.TaggedError('deepfryer/DataEncodeError')<{
  codec   : Codec;
  original: unknown;
  cause   : ParseResult.ParseError;
}> {}

export const Alliance = declareCodec(AllianceData);
export const DiscordEmbed = declareCodec(DiscordEmbedData);
export const Invocation = declareCodec(InvocationData);
export const Server = declareCodec(ServerData);
export const ServerInfo = declareCodec(ServerInfoData);
export const ServerClan = declareCodec(ServerClanData);
export const Transient = declareCodec(TransientData);
export const User = declareCodec(UserData);
export const UserPlayer = declareCodec(UserPlayerData);

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

export * as Codec from '#src/database/data/codec.ts';
export type Codec = | typeof Alliance
                    | typeof DiscordEmbed
                    | typeof Invocation
                    | typeof Server
                    | typeof ServerInfo
                    | typeof ServerClan
                    | typeof User
                    | typeof UserPlayer
                    | typeof Transient;

export type Dec<A extends Codec> = A['_'];
export type Enc<A extends Codec> = A['_i'];



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
      const enc = encoded as any;
      const acc = {} as any;
      for (const k in Object.keys(encoded)) {
        if (enc[k]) {
          acc[k] = enc[k];
        }
      }
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

export const fromTag = <A extends Codec>(tag: A['_tag']) => TagMap[tag];

const thing = fromTag('User');
