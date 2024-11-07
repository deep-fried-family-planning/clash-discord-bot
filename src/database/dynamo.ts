import {pipe} from '#src/internals/re-exports/effect.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';

export const getAllClans = () => pipe(
    DynamoDBDocumentService.scan({
        TableName: process.env.DDB_OPERATIONS,
        IndexName: 'GSA_ALL_CLANS',
    }),
);
