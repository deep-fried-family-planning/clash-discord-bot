import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

export const aws_ddb = DynamoDBDocument.from(new DynamoDBClient({}));

interface ServerTrackingRecord {
    type   : string; // hash key
    clans  : string[];
    players: string[];
}

export const getServerTrackingRecord = async (serverId: string) => {
    const clans = await aws_ddb.get({
        TableName: process.env.DDB_TRACKING,
        Key      : {type: serverId},
    });

    return clans.Item as ServerTrackingRecord;
};
