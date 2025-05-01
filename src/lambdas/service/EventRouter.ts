import {LambdasConfig} from '#src/lambdas/service/environment.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Duration, Effect, pipe} from 'effect';
import {devServer} from 'scripts/dev/dev-server.ts';
import type {WsCtx} from 'scripts/dev/dev_ws.ts';

export class EventRouter extends Effect.Service<EventRouter>()('deepfryer/EventRouter', {
  effect: Effect.gen(function* () {
    const lambda = yield* Lambda;
    const lambdas = yield* LambdasConfig;

    return {
      invoke: (name: keyof typeof lambdas, data: any) =>
        Effect.asVoid(
          lambda.invokeAsync({
            FunctionName: lambdas[name],
            InvokeArgs  : JSON.stringify(data),
          }),
        ),
      isActive: (name: keyof typeof lambdas, data: any) =>
        Effect.succeed(true),
    };
  }),
  dependencies: [
    Lambda.defaultLayer,
  ],
  accessors: true,
}) {}

class QualEventRouter extends Effect.Service<EventRouter>()('deepfryer/EventRouter', {
  effect: Effect.gen(function* () {
    const document = yield* DynamoDBDocument;
    const gateway = yield* ApiGatewayManagementApi;
    const lambda = yield* Lambda;
    const lambdas = yield* LambdasConfig;

    const cached = yield* pipe(
      document.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : {
          pk: 'dev_ws',
          sk: 'now',
        },
      }),
      Effect.cachedWithTTL(Duration.seconds(10)),
    );

    return {
      invoke: (name, data) =>
        pipe(
          cached,
          Effect.flatMap((res) => Effect.fromNullable(res.Item?.context as WsCtx)),
          Effect.flatMap((ctx) =>
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
          Effect.catchTag('NoSuchElementException', () =>
            lambda.invokeAsync({
              FunctionName: lambdas[name],
              InvokeArgs  : JSON.stringify(data),
            }),
          ),
          Effect.asVoid,
        ),
      isActive: (name, data) =>
        pipe(
          cached,
          Effect.flatMap((res) => Effect.fromNullable(res.Item?.context as WsCtx)),
          Effect.flatMap((ctx) =>
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
          Effect.as(true),
          Effect.catchTags({
            NoSuchElementException: () => Effect.succeed(false),
          }),
        ),
    } as EventRouter;
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

class LocalEventRouter extends Effect.Service<EventRouter>()('deepfryer/EventRouter', {
  succeed: {
    invoke: (name, data) =>
      Effect.asVoid(
        Effect.promise(async () => await devServer(name, JSON.stringify(data))),
      ),
    isActive: () =>
      Effect.succeed(true),
  } as Omit<EventRouter, '_tag'>,
  dependencies: [],
  accessors   : true,
}) {}

export const EventRouterLive =
  process.env.LAMBDA_LOCAL === 'true' ? LocalEventRouter.Default
  : process.env.LAMBDA_ENV === 'prod' ? EventRouter.Default
  : QualEventRouter.Default;
