import type {PlayerTag, ServerRecord, UserId} from '#src/data-store/store-server.ts';
import {ddb} from '#src/data/api/aws-ddb.ts';

export type UserLinkRecord = {
    id  : 'user-link';
    link: {[k in UserId]: Set<PlayerTag>};
};

export type PlayerLinkRecord = {
    id  : 'player-link';
    link: {[k in PlayerTag]: UserId};
};

export const putLinkRecord = async (userLinks: UserLinkRecord, playerLinks: PlayerLinkRecord) => {
    await ddb.put({
        TableName: process.env.DDB_SERVER,
        Item     : userLinks,
    });
    await ddb.put({
        TableName: process.env.DDB_SERVER,
        Item     : playerLinks,
    });
};

export const getUserLink = async () => {
    const record = await ddb.get({
        TableName: process.env.DDB_SERVER,
        Key      : {id: 'user-link'},
    });

    return record.Item as ServerRecord;
};

export const getPlayerLink = async () => {
    const record = await ddb.get({
        TableName: process.env.DDB_SERVER,
        Key      : {id: 'player-link'},
    });

    return record.Item as ServerRecord;
};
