import type {RestEmbed} from '#pure/dfx';
import {DT, g, pipe} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import type {IxIn} from '#src/internal/disreact/entity/types/rx.ts';
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

  return JSON.parse(resp.Item!.ix as str) as Ix.Rest;
});


export const saveCurrentIxForDialog = (ix: Ix.Rest, embeds: RestEmbed[], components: Component[]) => g(function * () {
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


export const saveIx = (id: str, ix: Ix.Rest) => g(function * () {
  const key = {
    pk: `t-${id}`,
    sk: `t-${id}`,
  };

  const now = yield * DT.now;

  yield * DynamoDBDocument.put({
    TableName: process.env.DDB_OPERATIONS,
    Item     : {
      ...key,
      _tag: 'DiscordIx',
      ix  : JSON.stringify(ix),
      ttl : pipe(
        now,
        DT.addDuration('5 minutes'),
        DT.toEpochMillis,
      ),
    },
  });

  return ix as IxIn;
});


export const loadIx = (id: str) => g(function * () {
  if (!id) return yield * noFix();

  const key = {
    pk: `t-${id}`,
    sk: `t-${id}`,
  };

  const resp = yield * DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : key,
  });

  if (!resp.Item) return yield * noFix();

  return JSON.parse(resp.Item.ix as str) as Ix.Rest;
});


export const saveFallback = (id: str) => g(function * () {
  const key = {
    pk: `t-${id}`,
    sk: `t-${id}`,
  };
});
