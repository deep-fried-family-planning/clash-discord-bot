import type {WsCtx} from '#dev/dev_ws.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {Lambda} from '@effect-aws/client-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {LambdaProxyEnv, LambdaRoutesEnv} from 'config/aws.ts';
import * as Config from 'effect/Config';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Layer from 'effect/Layer';

export class EventRouter extends E.Service<EventRouter>()('deepfryer/EventRouter', {
  effect: E.gen(function* () {
    const lambda = yield* Lambda;
    const routes = yield* LambdaRoutesEnv;

    return {
      invoke: (name: keyof typeof routes, data: any) =>
        E.asVoid(
          lambda.invokeAsync({
            FunctionName: routes[name],
            InvokeArgs  : JSON.stringify(data),
          }),
        ),
      isActive: (name: keyof typeof routes, data: any) =>
        E.succeed(true),
    };
  }),
  dependencies: [
    Lambda.defaultLayer,
  ],
  accessors: true,
}) {}

const makeQualEventRouter = () => Layer.effect(EventRouter, E.gen(function* () {
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
    E.catchAllCause(() => E.succeed(undefined)),
    E.flatMap((res) => E.fromNullable(res?.Item?.context as WsCtx)),
    E.cachedWithTTL(Duration.seconds(10)),
  );

  return EventRouter.make({
    invoke: (name, data) =>
      pipe(
        cached,
        E.tap((ctx) =>
          E.ignoreLogged(
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
        ),
        E.catchTag('NoSuchElementException', () =>
          lambda.invokeAsync({
            FunctionName: routes[name],
            InvokeArgs  : JSON.stringify(data),
          }),
        ),
        E.asVoid,
      ),
    isActive: (name, data) =>
      pipe(
        cached,
        E.tap((ctx) =>
          E.ignoreLogged(
            gateway.postToConnection({
              ConnectionId: ctx.connectionId,
              Data        : JSON.stringify({kind: name, data}),
            }),
          ),
        ),
        E.as(true),
        E.catchTags({
          NoSuchElementException: () => E.succeed(false),
        }),
      ),
  });
}).pipe(
  E.provide(Layer.mergeAll(
    DynamoDBDocument.defaultLayer,
    Lambda.defaultLayer,
    Layer.unwrapEffect(LambdaProxyEnv.pipe(
      E.map((proxy) =>
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
