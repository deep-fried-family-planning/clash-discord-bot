import {Database} from '#src/database/arch/Database.ts';
import {GSI_ALL_CLANS, GSI_ALL_PLAYERS, GSI_ALL_SERVERS} from '#src/database/data-const/gsi-tag.ts';
import {Db} from '#src/database/db.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';

export const getClansForServer = (pk: string) =>
  Database.scanPartitionEntirelyCached(Db.ServerClan, pk);

export const queryServerClans = (sk: string) =>
  pipe(
    Database.queryIndexEntirely(
      'GSI_ALL_CLANS',
      'gsi_clan_tag = :gsi_clan_tag',
      {
        ':gsi_clan_tag': Db.ServerClan.encodeSk(sk),
      },
    ),
    E.flatMap((items) => Db.decodeUpgradeItems(Db.ServerClan, items)),
  );

export const scanServerClans = () =>
  pipe(
    Database.scanIndexEntirely(GSI_ALL_CLANS),
    E.flatMap((items) => Db.decodeUpgradeItems(Db.ServerClan, items)),
  );

export const getPlayersForServer = (pk: string) =>
  Db.readPartition(Db.UserPlayer, pk);

export const queryUserPlayers = (sk: string) =>
  pipe(
    Database.queryIndexEntirely(
      GSI_ALL_PLAYERS,
      'gsi_player_tag = :gsi_player_tag',
      {
        ':gsi_player_tag': Db.UserPlayer.encodeSk(sk),
      },
    ),
    E.flatMap((items) => Db.decodeUpgradeItems(Db.UserPlayer, items)),
  );

export const scanUserPlayers = () =>
  pipe(
    Database.scanIndexEntirelyCached(GSI_ALL_PLAYERS),
    E.flatMap((items) => Db.decodeUpgradeItems(Db.UserPlayer, items)),
    E.map((items) => {
      console.log(items);
      return items.filter(Boolean) as Db.UserPlayer[];
    }),
  );

export const scanServers = () =>
  pipe(
    Database.scanIndexEntirelyCached(GSI_ALL_SERVERS),
    E.flatMap((items) => Db.decodeUpgradeItems(Db.Server, items)),
  );
