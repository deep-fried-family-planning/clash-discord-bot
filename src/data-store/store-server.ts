import type {Snowflake} from 'discord-api-types/v10';
import {ddb} from '#src/data/api/aws-ddb.ts';

export type ServerId = Snowflake;
export type UserId = Snowflake;
export type RoleId = Snowflake;
export type ChannelId = Snowflake;
export type PlayerTag = string;

export type ServerRecord = {
    id: ServerId;

    roles: {
        admin: RoleId[];
    };
    custom_roles: {[k in string]: RoleId};

    channels: {
        countdowns: ChannelId[];
    };
    channels_toggles: {
        countdowns: {[k in UserId]: boolean};
    };

    links: {
        [k in PlayerTag]: UserId
    };
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
        Key      : {id: serverId},
    });

    return record.Item as ServerRecord;
};
