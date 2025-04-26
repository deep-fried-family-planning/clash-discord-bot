import {Database} from '#src/database/arch/Database.ts';
import {ServerClan, UserPlayer} from '#src/database/schema/index.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import { GSITag } from '#src/database/setup/enum';
import { Db } from './Db';

export const getClansForServer = (pk: string) =>
  Db.readPartition(ServerClan, pk);

export const queryServerClans = (sk: string) =>
  pipe(
    Database.query({
      TableName                : process.env.DDB_OPERATIONS,
      IndexName                : 'GSI_ALL_CLANS',
      KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
      ExpressionAttributeValues: {
        ':gsi_clan_tag': ServerClan.encodeSk(sk),
      },
    }),
    E.flatMap((res) => E.fromNullable(res.Items)),
    E.map((items) =>
      items.map((item) =>
        pipe(
          ServerClan.decode(item),
          E.catchTag('ParseError', () => E.succeed(undefined)),
          E.tap((dec) => {
            if (!dec?.upgraded) {
              return;
            }
            return pipe(
              ServerClan.encode(dec),
              E.flatMap((enc) => Database.cachedSave(enc)),
            );
          }),
        ),
      ),
    ),
    E.flatMap((items) => E.all(items, {concurrency: 'unbounded'})),
    E.map((items) => items.filter(Boolean) as typeof ServerClan.Type[]),
  );

export const scanServerClans = () =>
  pipe(
    Database.cachedScanIndex(GSITag.ALL_CLANS),
    E.map((items) =>
      items.map((item) =>
        pipe(
          ServerClan.decode(item),
          E.catchTag('ParseError', () => E.succeed(undefined)),
          E.tap((dec) => {
            if (!dec?.upgraded) {
              return;
            }
            return pipe(
              ServerClan.encode(dec),
              E.flatMap((enc) => Database.cachedSave(enc)),
            );
          }),
        ),
      ),
    ),
    E.flatMap((items) => E.all(items, {concurrency: 'unbounded'})),
    E.map((items) => items.filter(Boolean) as typeof ServerClan.Type[]),
  );

export const getPlayersForServer = (pk: string) =>
  Db.readPartition(UserPlayer, pk);

export const queryUserPlayers = (sk: string) =>
  pipe(
    Database.query({
      TableName                : process.env.DDB_OPERATIONS,
      IndexName                : 'GSI_ALL_PLAYERS',
      KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
      ExpressionAttributeValues: {
        ':gsi_player_tag': UserPlayer.encodeSk(sk),
      },
    }),
    E.flatMap((res) => E.fromNullable(res.Items)),
    E.map((items) =>
      items.map((item) =>
        pipe(
          UserPlayer.decode(item),
          E.catchTag('ParseError', () => E.succeed(undefined)),
          E.tap((dec) => {
            if (!dec?.upgraded) {
              return;
            }
            return pipe(
              UserPlayer.encode(dec),
              E.flatMap((enc) => Database.cachedSave(enc)),
            );
          }),
        ),
      ),
    ),
    E.flatMap((items) => E.all(items, {concurrency: 'unbounded'})),
    E.map((items) => items.filter(Boolean) as typeof UserPlayer.Type[]),
  );

export const scanUserPlayers = () =>
  pipe(
    Database.cachedScanIndex(GSITag.ALL_PLAYERS),
    E.map((items) =>
      items.map((item) =>
        pipe(
          UserPlayer.decode(item),
          E.catchTag('ParseError', () => E.succeed(undefined)),
          E.tap((dec) => {
            if (!dec?.upgraded) {
              return;
            }
            return pipe(
              UserPlayer.encode(dec),
              E.flatMap((enc) => Database.cachedSave(enc)),
            );
          }),
        ),
      ),
    ),
    E.flatMap((items) => E.all(items, {concurrency: 'unbounded'})),
    E.map((items) => {
      console.log(items);
      return items.filter(Boolean) as typeof UserPlayer.Type[];
    }),
  );

export const scanServers = () =>
  pipe(
    Database.scanIndex('GSI_ALL_SERVERS'),
    E.map((items) =>
      items.map((item) =>
        pipe(
          Db.Server.decode(item),
          E.catchTag('ParseError', (e) => {
            console.log(e);
            return E.succeed(undefined);
          }),
          E.tap((dec) => {
            console.log(dec);
            if (!dec?.upgraded) {
              return;
            }
            return pipe(
              Db.Server.encode(dec),
              E.flatMap((enc) => Database.cachedSave(enc)),
            );
          }),
        ),
      ),
    ),
    E.flatMap((items) => E.all(items, {concurrency: 'unbounded'})),
  );
