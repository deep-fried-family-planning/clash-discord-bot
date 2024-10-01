import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

export const aws_ddb = DynamoDBDocument.from(new DynamoDBClient({}));
