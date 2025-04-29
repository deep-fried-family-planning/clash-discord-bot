import {Codec} from '#src/database/data/index.ts';
import {DataDriver} from '#src/database/service/DataDriver.ts';

export const get = (serverId: string, clanTag: string) => DataDriver.use((db) =>
  db.createItemCached(
    Codec.ServerClan,
    {
      serverId,
      clanTag,
    },
  ),
);

export const query = () => {};

export const scanAll = () => {};

export const register = () => {};

export const update = () => {};
