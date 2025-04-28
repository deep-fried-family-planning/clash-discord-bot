import {Server, ServerClan, UserPlayer} from '#src/database/data/codec.ts';
import {GSI_ALL_CLANS, GSI_ALL_PLAYERS, GSI_ALL_SERVERS} from '#src/database/data/const/gsi-tag.ts';
import {Db} from '#src/database/db.ts';
import {DataDriver} from '#src/database/service/DataDriver.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';

export const getClansForServer = (pk: string) =>
  DataDriver.scanPartitionEntirelyCached(ServerClan, pk);

export const queryServerClans = (sk: string) =>
  pipe(
    DataDriver.queryIndexEntirely(
      'GSI_ALL_CLANS',
      'gsi_clan_tag = :gsi_clan_tag',
      {
        ':gsi_clan_tag': ServerClan.encodeSk(sk),
      },
    ),
    E.flatMap((items) => Db.decodeUpgradeItems(ServerClan, items)),
  );

export const scanServerClans = () =>
  pipe(
    DataDriver.scanIndexEntirely(GSI_ALL_CLANS),
    E.flatMap((items) => Db.decodeUpgradeItems(ServerClan, items)),
  );

export const getPlayersForServer = (pk: string) =>
  Db.readPartition(UserPlayer, pk);

export const queryUserPlayers = (sk: string) =>
  pipe(
    DataDriver.queryIndexEntirely(
      GSI_ALL_PLAYERS,
      'gsi_player_tag = :gsi_player_tag',
      {
        ':gsi_player_tag': UserPlayer.encodeSk(sk),
      },
    ),
    E.flatMap((items) => Db.decodeUpgradeItems(UserPlayer, items)),
  );

export const scanUserPlayers = () =>
  pipe(
    DataDriver.scanIndexEntirelyCached(UserPlayer, GSI_ALL_PLAYERS),
    E.flatMap((items) => Db.decodeUpgradeItems(UserPlayer, items)),
    E.map((items) => {
      console.log(items);
      return items.filter(Boolean) as UserPlayer[];
    }),
  );

export const scanServers = () =>
  pipe(
    DataDriver.scanIndexEntirelyCached(Server, GSI_ALL_SERVERS),
    E.flatMap((items) => Db.decodeUpgradeItems(Server, items)),
  );
