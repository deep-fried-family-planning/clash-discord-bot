import {LambdaProxyEnv, LambdaRoutesEnv} from 'config/aws.ts';
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

const makeQualEventRouter = () => Layer.effect(EventRouter, Effect.gen(function* () {
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
    Effect.catchAllCause(() => Effect.succeed(undefined)),
    Effect.flatMap((res) => Effect.fromNullable(res?.Item?.context as WsCtx)),
    Effect.cachedWithTTL(Duration.seconds(10)),
  );

  return EventRouter.make({
    invoke: (name, data) =>
      pipe(
        cached,
        Effect.tap((ctx) =>
          Effect.ignoreLogged(
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
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
        Effect.tap((ctx) =>
          Effect.ignoreLogged(
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
        ),
        Effect.as(true),
        Effect.catchTags({
          NoSuchElementException: () => Effect.succeed(false),
        }),
      ),
  });
}).pipe(
  Effect.provide(Layer.mergeAll(
    DynamoDBDocument.defaultLayer,
    Lambda.defaultLayer,
    Layer.unwrapEffect(LambdaProxyEnv.pipe(
      Effect.map((proxy) =>
        ApiGatewayManagementApi.layer({
          endpoint: proxy.DFFP_APIGW_DEV_WS,
        }),
      ),
    )),
  )),
));

export const EventRouterLive = () =>
  process.env.LAMBDA_ENV === 'prod' ? EventRouter.Default :
  makeQualEventRouter();
