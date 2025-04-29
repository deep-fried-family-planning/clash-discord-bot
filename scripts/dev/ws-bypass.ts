import {E, L, O, pipe} from '#src/internal/pure/effect.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Duration} from 'effect';
import type {WsCtx} from 'scripts/dev/dev_ws.ts';

export const WS_BYPASS_KEY = {
  pk: 'dev_ws',
  sk: 'now',
};

const names = {
  ix_slash: process.env.LAMBDA_ARN_IX_SLASH,
  ix_menu : process.env.LAMBDA_ARN_DISCORD_MENU,
  poll    : process.env.LAMBDA_ARN_IX_SLASH,
  task    : process.env.LAMBDA_ARN_IX_SLASH,
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
  accessors: true,
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
      routeTo: (name: keyof typeof names, data: any) => {
        if (process.env.LAMBDA_LOCAL === 'true') {
          return E.void;
        }
        return getBypass.pipe(
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
        );
      },

      shouldRoute: (name: keyof typeof names, data: any = {}) => {
        if (process.env.LAMBDA_LOCAL === 'true') {
          return E.void;
        }
        return getBypass.pipe(E.andThen(
          O.match({
            onSome: (ws) =>
              pipe(
                apigw.postToConnection({
                  ConnectionId: ws.connectionId,
                  Data        : JSON.stringify({kind: name, data}),
                }),
                E.as(true),
              ),
            onNone: () =>
              E.succeed(false),
          }),
        ));
      },
    };
  }),
  accessors: true,
}) {}

export const PassServiceLayer = process.env.LAMBDA_ENV === 'prod'
  ? PassService.Default.pipe(L.provide(Lambda.defaultLayer))
  : BypassService.Default.pipe(
    L.provide(
      L.mergeAll(
        Lambda.defaultLayer,
        ApiGatewayManagementApi.layer({
          endpoint: process.env.APIGW_DEV_WS,
        }),
        DynamoDBDocument.defaultLayer,
      ),
    ),
  );
