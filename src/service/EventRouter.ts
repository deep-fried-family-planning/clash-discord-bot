import {LambdaProxyEnv, LambdaRoutesEnv} from '#config/aws.ts';
import {devServer} from '#dev/dev-server.ts';
import type {WsCtx} from '#dev/dev_ws.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Config, Duration, Effect, Layer, pipe} from 'effect';

export class EventRouter extends Effect.Service<EventRouter>()('deepfryer/EventRouter', {
  effect: Effect.gen(function* () {
    const lambda = yield* Lambda;
    const routes = yield* LambdaRoutesEnv;

    return {
      invoke: (name: keyof typeof routes, data: any) =>
        Effect.asVoid(
          lambda.invokeAsync({
            FunctionName: routes[name],
            InvokeArgs  : JSON.stringify(data),
          }),
        ),
      isActive: (name: keyof typeof routes, data: any) =>
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
    const [proxy, routes] = yield* Config.all([LambdaProxyEnv, LambdaRoutesEnv]);

    const cached = yield* pipe(
      document.get({
        TableName: proxy.DFFP_DDB_OPERATIONS,
        Key      : {
          pk: proxy.DFFP_APIGW_DEV_WS_PK,
          sk: proxy.DFFP_APIGW_DEV_WS_SK,
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
              FunctionName: routes[name],
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
    Layer.unwrapEffect(LambdaProxyEnv.pipe(
      Effect.map((proxy) =>
        ApiGatewayManagementApi.layer({
          endpoint: proxy.DFFP_APIGW_DEV_WS,
        }),
      ),
    )),
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
  accessors: true,
}) {}

export const EventRouterLive =
  process.env.LAMBDA_LOCAL === 'true' ? LocalEventRouter.Default :
  process.env.LAMBDA_ENV === 'prod' ? EventRouter.Default :
  QualEventRouter.Default;
