import {GsiPoll} from '#src/data/items/index.ts';
import {DiscordREST} from 'dfx';
import type {GuildMember} from 'dfx/types';
import * as Array from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';

export const pollScanStream = (input: Parameters<typeof GsiPoll.scan>[0]) =>
  Stream.paginateChunkEffect(
    input.ExclusiveStartKey,
    (last) =>
      pipe(
        GsiPoll.scan({
          ...input,
          Limit            : 25,
          ExclusiveStartKey: last,
        }),
        E.map((res) => [Chunk.fromIterable(res.Items), Option.fromNullable(res.LastEvaluatedKey)]),
      ),
  );

export const serverMemberStream = (server_id: string) =>
  Stream.paginateChunkEffect(
    undefined as undefined | GuildMember,
    (last) =>
      pipe(
        DiscordREST,
        E.flatMap((discord) =>
          discord.listGuildMembers(
            server_id,
            last
              ? {limit: 100, after: last.user!.id}
              : {limit: 100},
          ).json,
        ),
        E.map((res) => [Chunk.fromIterable(res), Array.last(res)]),
      ),
  );
