import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

export const aws_ddb = /* @__PURE__ */ DynamoDBDocument.from(new DynamoDBClient({}));
