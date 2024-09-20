import type {Snowflake} from 'discord-api-types/v10';
import {ddb} from '#src/data/api/aws-ddb.ts';

type ServerId = Snowflake;
type UserId = Snowflake;
type PlayerTag = string;

export type ServerRecord = {
    id: ServerId;

    links: {[k in PlayerTag]: UserId};
};

export const putServerRecord = async (serverRecord: ServerRecord) => {
    await ddb.put({
        TableName: process.env.DDB_SERVER,
        Item     : serverRecord,
    });
};

export const getServerRecord = async (serverId: ServerId) => {
    const record = await ddb.get({
        TableName: process.env.DDB_SERVER,
        Key      : {
            id: serverId,
        },
    });

    return record.Item as ServerRecord;
};
