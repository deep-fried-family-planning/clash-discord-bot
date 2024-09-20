import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';

const base = new DynamoDBClient();

export const ddb = DynamoDBDocument.from(base);
