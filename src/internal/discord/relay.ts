import type {IxIn} from '#discord/utils/types.ts';
import {g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


export const resolveIx = (id: str) => g(function * () {
  const key = {
    pk: `t-${id}`,
    sk: `t-${id}`,
  };

  const resp = yield * DynamoDBDocument.get({
    TableName     : process.env.DDB_OPERATIONS,
    Key           : key,
    ConsistentRead: true,
  });

  yield * DynamoDBDocument.delete({
    TableName: process.env.DDB_OPERATIONS,
    Key      : key,
  });

  return JSON.parse(resp.Item!.ix as str) as IxIn;
});


export const saveIx = (ix: IxIn) => g(function * () {
  const key = {
    pk: `t-${ix.id}`,
    sk: `t-${ix.id}`,
  };

  yield * DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : {
      ...key,
      ix: JSON.stringify(ix),
    },
  });
});
