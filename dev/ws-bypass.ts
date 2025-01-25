/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */

import {type E, g} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {WsCtx} from './dev_ws.ts';



export const WS_BYPASS_KEY = {
  pk: 'dev_ws',
  sk: 'now',
};


export const wsBypass = <
  Nonbypass extends E.Effect<any, any, any>,
>(
  kind: str,
  data: any,
  nonbypass: Nonbypass,
) => g(function * () {
  if (process.env.LAMBDA_ENV === 'prod' || process.env.LAMBDA_LOCAL === 'true') {
    yield * nonbypass;
    return false;
  }

  const bypass = yield * DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : WS_BYPASS_KEY,
  });


  if (!bypass.Item) {
    yield * nonbypass;
    return false;
  }

  const wsctx = bypass.Item.context as WsCtx;

  yield * ApiGatewayManagementApi.postToConnection({
    ConnectionId: wsctx.connectionId,
    Data        : JSON.stringify({
      kind: kind,
      data: data,
    }),
  });

  return true;
});
