import type {IxIn} from '#discord/types.ts';
import type {RestEmbed} from '#pure/dfx';
import {g} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {Component} from 'dfx/types';


export const getPreviousIxForDialog = (id: str) => g(function * () {
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


export const saveCurrentIxForDialog = (ix: IxIn, embeds: RestEmbed[], components: Component[]) => g(function * () {
  const key = {
    pk: `t-${ix.id}`,
    sk: `t-${ix.id}`,
  };

  const newIx = {
    ...ix,
    message: {
      ...ix.message,
      embeds,
      components,
    },
  };

  yield * DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : {
      ...key,
      type: 'DiscordDialogSubmitRelay',
      ix  : JSON.stringify(newIx),
    },
  });

  return newIx as IxIn;
});
