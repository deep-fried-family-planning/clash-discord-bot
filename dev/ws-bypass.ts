import {E, g, O, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Duration} from 'effect';
import type {WsCtx} from './dev_ws.ts';

export const WS_BYPASS_KEY = {
  pk: 'dev_ws',
  sk: 'now',
};

export const wsBypass = <A, E, R>(kind: str, data: any, nonbypass: E.Effect<A, E, R>) => g(function* () {
  if (process.env.LAMBDA_ENV === 'prod' || process.env.LAMBDA_LOCAL === 'true') {
    yield* nonbypass;
    return false;
  }

  const bypass = yield* DynamoDBDocument.get({
    TableName: process.env.DDB_OPERATIONS,
    Key      : WS_BYPASS_KEY,
  });

  if (!bypass.Item) {
    yield* nonbypass;
    return false;
  }

  const wsctx = bypass.Item.context as WsCtx;

  yield* ApiGatewayManagementApi.postToConnection({
    ConnectionId: wsctx.connectionId,
    Data        : JSON.stringify({
      kind: kind,
      data: data,
    }),
  });

  return true;
});

const names = {
  interactions_command: process.env.LAMBDA_ARN_IX_SLASH,
  interactions_menu   : process.env.LAMBDA_ARN_DISCORD_MENU,
  poll                : process.env.LAMBDA_ARN_IX_SLASH,
  task                : process.env.LAMBDA_ARN_IX_SLASH,
};

export class PassService extends E.Service<PassService>()('deepfryer/PassService', {
  effect: Lambda.use((lambda) =>
    ({
      routeTo: (name: keyof typeof names, data: any) =>
        lambda.invoke({
          FunctionName  : names[name],
          InvocationType: 'Event',
          Payload       : JSON.stringify(data),
        }),

      shouldRoute: (name: keyof typeof names, data?: any) =>
        E.succeed(false),
    }),
  ),
  dependencies: [Lambda.defaultLayer],
  accessors   : true,
}) {}

export class BypassService extends E.Service<PassService>()(PassService.key, {
  effect: E.gen(function* () {
    const dynamo = yield* DynamoDBDocument;
    const apigw = yield* ApiGatewayManagementApi;
    const lambda = yield* Lambda;

    const getBypass = yield* pipe(
      dynamo.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : WS_BYPASS_KEY,
      }),
      E.map((res) => O.fromNullable(res.Item?.context as WsCtx)),
      E.cachedWithTTL(Duration.seconds(10)),
    );

    return {
      routeTo: (name: keyof typeof names, data: any) =>
        getBypass.pipe(
          E.andThen(
            O.match({
              onSome: (ws) =>
                apigw.postToConnection({
                  ConnectionId: ws.connectionId,
                  Data        : JSON.stringify({kind: name, data}),
                }),
              onNone: () =>
                lambda.invoke({
                  FunctionName  : names[name],
                  InvocationType: 'Event',
                  Payload       : JSON.stringify(data),
                }),
            }),
          ),
        ),

      shouldRoute: (name: keyof typeof names, data: any = {}) =>
        getBypass.pipe(E.andThen(
          O.match({
            onSome: (ws) =>
              pipe(
                apigw.postToConnection({
                  ConnectionId: ws.connectionId,
                  Data        : JSON.stringify({kind: name, data}),
                }),
                E.fork,
                E.as(true),
              ),
            onNone: () =>
              E.succeed(false),
          }),
        )),
    };
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
    Lambda.defaultLayer,
    ApiGatewayManagementApi.layer({
      endpoint: process.env.APIGW_DEV_WS,
    }),
  ],
  accessors: true,
}) {}

export const makePassServiceLayer = () => {
  if (process.env.LAMBDA_ENV === 'prod' || process.env.LAMBDA_LOCAL === 'true') {
    return PassService.Default;
  }
  return BypassService.Default;
};
