import {Codec, Server, ServerClan, UserPlayer} from '#src/database/data/codec.ts';
import {GSI_ALL_CLANS, GSI_ALL_PLAYERS, GSI_ALL_SERVERS} from '#src/database/data/const/gsi-tag.ts';
import {DeepFryerDocument} from '#src/database/DeepFryerDocument.ts';
import {DeepFryerPage} from '#src/database/DeepFryerPage.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Console} from 'effect';
import * as Chunk from 'effect/Chunk';
import type {ParseError} from 'effect/ParseResult';
import * as Stream from 'effect/Stream';
import * as Array from 'effect/Array';

export * as Db from '#src/database/db.ts';
export type Db = never;

export const decodeUpgradeItem = <A extends Codec>(s: A, item: Codec.Enc<A>) =>
  pipe(
    Codec.decodeItem(s, item),
    E.tap((dec) =>
      dec?.upgraded
        ? E.fork(saveItem(s, dec))
        : undefined,
    ),
  );

export const decodeUpgradeItems = <A extends Codec>(s: A, items: Chunk.Chunk<Codec.Enc<A>>) =>
  pipe(
    Chunk.toArray(items),
    Array.map((item) => decodeUpgradeItem(s, item)),
    E.allWith({concurrency: 'unbounded'}),
    E.map((items) => items.filter((item) => !!item)),
  );

export const saveItem = <A extends Codec>(s: A, item: A['_']) =>
  pipe(
    Codec.encodeItem(s, item),
    // E.tap((enc) => DeepFryerDocument.put(enc as any)),
    // E.tap((enc) => Console.log(enc)),
  );

export const readItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  pipe(
    DeepFryerDocument.get({
      codec: s,
      Key  : s.encodeKey(pk, sk),
    }),
    E.flatMap((item) => E.fromNullable(item)),
    E.flatMap((item) => decodeUpgradeItem(s, item.Item as any)),
  );

export const readItem2 = <A extends Codec>(s: A, {pk, sk}: {pk: string; sk: string}) =>
  pipe(
    DeepFryerDocument.get({
      codec: s,
      Key  : s.encodeKey(pk, sk),
    }),
    E.flatMap((item) => E.fromNullable(item)),
    E.flatMap((item) => decodeUpgradeItem(s, item.Item as any)),
  );

export const readPartition = <A extends Codec>(s: A, pk: string) =>
  pipe(
    DeepFryerPage.pageQuery({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: {':pk': s.encodePk(pk)},
      ConsistentRead           : true,
      Limit                    : 25,
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(s, items as any)),
  );
export const readPartition2 = <A extends Codec>(s: A, {pk}: {pk: string}) =>
  pipe(
    DeepFryerPage.pageQuery({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: {':pk': s.encodePk(pk)},
      ConsistentRead           : true,
      Limit                    : 25,
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(s, items as any)),
  );

export const deleteItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  DeepFryerDocument.delete({
    codec: s,
    Key  : s.encodeKey(pk, sk),
  });
export const deleteItem2 = <A extends Codec>(s: A, {pk, sk}: {pk: string; sk: string}) =>
  DeepFryerDocument.delete({
    codec: s,
    Key  : s.encodeKey(pk, sk),
  });

export const getClansForServer = (pk: string) =>
  readPartition(ServerClan, pk);

export const queryServerClans = (sk: string) =>
  pipe(
    DeepFryerPage.pageQuery({
      IndexName                : GSI_ALL_CLANS,
      KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
      ExpressionAttributeValues: {
        ':gsi_clan_tag': ServerClan.encodeSk(sk),
      },
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(ServerClan, items as any)),
  );

export const scanServerClans = () =>
  pipe(
    DeepFryerPage.pageScan({
      IndexName: GSI_ALL_CLANS,
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(ServerClan, items as any)),
  );

export const getPlayersForServer = (pk: string) =>
  readPartition(UserPlayer, pk);

export const queryUserPlayers = (sk: string) =>
  pipe(
    DeepFryerPage.pageQuery({
      IndexName                : GSI_ALL_PLAYERS,
      KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
      ExpressionAttributeValues: {
        ':gsi_player_tag': UserPlayer.encodeSk(sk),
      },
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(UserPlayer, items as any)),
  );

export const scanUserPlayers = () =>
  pipe(
    DeepFryerPage.pageScan({
      IndexName: GSI_ALL_PLAYERS,
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(UserPlayer, items as any)),
  );

export const scanServers = () =>
  pipe(
    DeepFryerPage.pageScan({
      IndexName: GSI_ALL_SERVERS,
    }),
    E.flatMap((stream) => Stream.runCollect(stream)),
    E.flatMap((items) => decodeUpgradeItems(Server, items as any)),
  );
