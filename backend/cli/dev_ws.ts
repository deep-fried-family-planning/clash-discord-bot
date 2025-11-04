import {COLOR, nColor} from 'src/internal/old/colors.ts';
import {MD} from 'src/internal/pure/pure.ts';
import {DeepFryerLogger} from 'src/service/DeepFryerLogger.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import type {APIGatewayProxyWebsocketEventV2} from 'aws-lambda';
import type {APIGatewayProxyResultV2} from 'aws-lambda/trigger/api-gateway-proxy';
import {LambdaProxyEnv} from 'config/aws.ts';
import {AwsLambdaEnv, DiscordEnv, DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import * as Config from 'effect/Config';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';

export type WsCtx = APIGatewayProxyWebsocketEventV2['requestContext'];

const dev_ws = (event: APIGatewayProxyWebsocketEventV2) => E.gen(function* () {
  const discordREST = yield* DiscordREST;
  const [discord, proxy, aws] = yield* Config.all([DiscordEnv, LambdaProxyEnv, AwsLambdaEnv]);
  const route = event.requestContext.routeKey;
  const [token, id] = discord.DFFP_DISCORD_DEBUG_URL.split('/').reverse();

  if (route === '$connect') {
    yield* DynamoDBDocument.put({
      TableName: proxy.DFFP_DDB_OPERATIONS,
      Item     : {
        pk     : proxy.DFFP_APIGW_DEV_WS_PK,
        sk     : proxy.DFFP_APIGW_DEV_WS_SK,
        context: event.requestContext,
      },
    });

    yield* discordREST.executeWebhook(id, token, {
      payload: {
        embeds: [{
          color      : nColor(COLOR.SUCCESS),
          title      : 'dev: connect',
          description: MD.content(
            MD.h1(aws.AWS_LAMBDA_FUNCTION_NAME),
            JSON.stringify(event.requestContext, null, 2),
            JSON.stringify(event.body, null, 2),
          ),
        }],
      },
    });

    return {statusCode: 200};
  }

  if (route === '$disconnect') {
    yield* DynamoDBDocument.delete({
      TableName: proxy.DFFP_DDB_OPERATIONS,
      Key      : {
        pk: proxy.DFFP_APIGW_DEV_WS_PK,
        sk: proxy.DFFP_APIGW_DEV_WS_SK,
      },
    });

    yield* discordREST.executeWebhook(id, token, {
      payload: {
        embeds: [{
          color      : nColor(COLOR.ERROR),
          title      : 'dev: disconnect',
          description: MD.content(
            MD.h1(aws.AWS_LAMBDA_FUNCTION_NAME),
            JSON.stringify(event.requestContext, null, 2),
            JSON.stringify(event.body, null, 2),
          ),
        }],
      },
    });

    return {statusCode: 200};
  }

  yield* discordREST.executeWebhook(id, token, {
    payload: {
      embeds: [{
        color      : nColor(COLOR.INFO),
        title      : 'dev: received',
        description: MD.content(
          MD.h1(aws.AWS_LAMBDA_FUNCTION_NAME),
          JSON.stringify(event.requestContext, null, 2),
          JSON.stringify(event.body, null, 2),
        ),
      }],
    },
  });

  return {
    statusCode: 200,
    body      : JSON.stringify(event),
  } satisfies APIGatewayProxyResultV2;
});

const layer = pipe(
  DeepFryerLogger.Default.pipe(
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
  ),
  L.provideMerge(
    DynamoDBDocument.defaultLayer,
  ),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = LambdaHandler.make({
  handler: dev_ws,
  layer  : layer,
});
