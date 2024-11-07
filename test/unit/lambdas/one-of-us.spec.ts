import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';

const base = new DynamoDB({
    region: 'us-east-1',
});

const dynamoDB = DynamoDBDocument.from(base);

describe('adrian\'s shit', () => {
    it('put test code here', async () => {
        await dynamoDB.get({
            // TableName: find this NAME from either terraform files or AWS
            TableName: 'qual-dffp-clash-discord-bot-operations', // this is NOT an ARN or amazon resource number, just the name
            Key      : {
                pk: 'user-123', // 2nd set: user-123
                sk: 'player-#GG123', // 2nd set: player-#GG123
            },
        });
        // if this fails with resource not found, your creds work

    });
});
