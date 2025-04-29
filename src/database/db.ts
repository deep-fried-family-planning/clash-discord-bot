import {type Codec, Server, ServerClan, UserPlayer} from '#src/database/data/codec.ts';
import {GSI_ALL_CLANS, GSI_ALL_PLAYERS, GSI_ALL_SERVERS} from '#src/database/data/const/gsi-tag.ts';
import {DeepFryerDocument} from '#src/database/DeepFryerDocument.ts';
import {DeepFryerPage} from '#src/database/DeepFryerPage.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import * as Chunk from 'effect/Chunk';
import type {ParseError} from 'effect/ParseResult';
import * as Stream from 'effect/Stream';

export * as Db from '#src/database/db.ts';
export type Db = never;

export const saveItem = <A extends Codec>(s: A, item: A['_']) =>
  pipe(
    s.encode(item) as E.Effect<any, ParseError>,
    // E.tap((enc) => DeepFryerDocument.put(enc as any)),
    E.tap((enc) => console.log('saveItem', enc)),
  );

export const decodeUpgradeItem = <A extends Codec>(s: A, item: unknown) =>
  pipe(
    s.decode(item) as E.Effect<A['_'], ParseError>,
    E.catchTag('ParseError', () => E.succeed(undefined)),
    E.tap((dec) =>
      dec?.upgraded
        ? saveItem(s, dec)
        : undefined,
    ),
  );

export const decodeUpgradeItems = <A extends Codec>(s: A, items: unknown[] | Chunk.Chunk<unknown>) =>
  pipe(
    Chunk.fromIterable(items),
    Chunk.map((item) => decodeUpgradeItem(s, item)),
    E.allWith({concurrency: 'unbounded'}),
    E.map((items) => items.filter((item) => !!item)),
  );

export const readItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  pipe(
    DeepFryerDocument.get({
      codec: s,
      Key  : {pk, sk},
    }),
    E.flatMap((item) => decodeUpgradeItem(s, item.Item!)),
  );

export const readPartition = <A extends Codec>(s: A, pk: string) =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageQuery({
        KeyConditionExpression   : 'pk = :pk',
        ExpressionAttributeValues: {':pk': s.encodePk(pk)},
        ConsistentRead           : true,
        Limit                    : 25,
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(s, items)),
  );

export const deleteItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  DeepFryerDocument.delete({
    codec: s,
    Key  : {pk, sk},
  });

export const getClansForServer = (pk: string) =>
  readPartition(ServerClan, pk);

export const queryServerClans = (sk: string) =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageQuery({
        IndexName                : GSI_ALL_CLANS,
        KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
        ExpressionAttributeValues: {
          ':gsi_clan_tag': ServerClan.encodeSk(sk),
        },
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(ServerClan, items)),
  );

export const scanServerClans = () =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageScan({
        IndexName: GSI_ALL_CLANS,
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(ServerClan, items)),
  );

export const getPlayersForServer = (pk: string) =>
  readPartition(UserPlayer, pk);

export const queryUserPlayers = (sk: string) =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageQuery({
        IndexName                : GSI_ALL_PLAYERS,
        KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
        ExpressionAttributeValues: {
          ':gsi_player_tag': UserPlayer.encodeSk(sk),
        },
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(UserPlayer, items)),
  );

export const scanUserPlayers = () =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageScan({
        IndexName: GSI_ALL_PLAYERS,
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(UserPlayer, items)),
    E.map((items) => {
      console.log(items);
      return items.filter(Boolean) as UserPlayer[];
    }),
  );

export const scanServers = () =>
  pipe(
    Stream.runCollect(
      DeepFryerPage.pageScan({
        IndexName: GSI_ALL_SERVERS,
      }),
    ),
    E.flatMap((items) => decodeUpgradeItems(Server, items)),
  );
