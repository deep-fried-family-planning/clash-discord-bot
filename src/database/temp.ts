import {Database} from '#src/database/arch/Database.ts';
import {ServerClan, UserPlayer} from '#src/database/schema/index.ts';
import {GSITag} from '#src/database/setup/enum.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Db, saveItem, readPartition} from '#src/database/Db.ts';

export const getClansForServer = (pk: string) =>
  readPartition(ServerClan, pk);

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
    E.flatMap((items) =>
      E.all(
        items.map((item) =>
          pipe(
            ServerClan.decode(item),
            E.catchTag('ParseError', () => E.succeed(undefined)),
            E.tap((dec) => {
              if (!dec?.upgraded) {
                return;
              }
              return saveItem(ServerClan, dec);
            }),
          ),
        ),
        {concurrency: 'unbounded'},
      ),
    ),
    E.map((items) => items.filter(Boolean) as typeof ServerClan.Type[]),
  );

export const scanServerClans = () =>
  pipe(
    Database.readIndexCached(GSITag.ALL_CLANS),
    E.flatMap((items) =>
      E.all(
        items.map((item) =>
          pipe(
            ServerClan.decode(item),
            E.catchTag('ParseError', () => E.succeed(undefined)),
            E.tap((dec) => {
              if (!dec?.upgraded) {
                return;
              }
              return saveItem(ServerClan, dec);
            }),
          ),
        ),
        {concurrency: 'unbounded'},
      ),
    ),
    E.map((items) => items.filter(Boolean) as typeof ServerClan.Type[]),
  );

export const getPlayersForServer = (pk: string) =>
  readPartition(UserPlayer, pk);

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
    E.flatMap((items) =>
      E.all(
        items.map((item) =>
          pipe(
            UserPlayer.decode(item),
            E.catchTag('ParseError', () => E.succeed(undefined)),
            E.tap((dec) => {
              if (!dec?.upgraded) {
                return;
              }
              return saveItem(UserPlayer, dec);
            }),
          ),
        ),
        {concurrency: 'unbounded'},
      ),
    ),
    E.map((items) => items.filter(Boolean) as typeof UserPlayer.Type[]),
  );

export const scanUserPlayers = () =>
  pipe(
    Database.readIndexCached(GSITag.ALL_PLAYERS),
    E.flatMap((items) =>
      E.all(
        items.map((item) =>
          pipe(
            UserPlayer.decode(item),
            E.catchTag('ParseError', () => E.succeed(undefined)),
            E.tap((dec) => {
              if (!dec?.upgraded) {
                return;
              }
              return saveItem(UserPlayer, dec);
            }),
          ),
        ),
        {concurrency: 'unbounded'},
      ),
    ),
    E.map((items) => {
      console.log(items);
      return items.filter(Boolean) as typeof UserPlayer.Type[];
    }),
  );

export const scanServers = () =>
  pipe(
    Database.readIndexCached(GSITag.ALL_SERVERS),
    E.flatMap((items) =>
      E.all(
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
              return saveItem(Db.Server, dec);
            }),
          ),
          {concurrency: 'unbounded'},
        ),
      ),
    ),
  );
