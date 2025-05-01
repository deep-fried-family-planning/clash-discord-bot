import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {APIGatewayProxyWebsocketEventV2} from 'aws-lambda';
import type {APIGatewayProxyResultV2} from 'aws-lambda/trigger/api-gateway-proxy';
import {WS_BYPASS_KEY} from 'scripts/dev/proxy-config.ts';

export type WsCtx = APIGatewayProxyWebsocketEventV2['requestContext'];

const dev_ws = (event: APIGatewayProxyWebsocketEventV2) => E.gen(function* () {
  const route = event.requestContext.routeKey;

  const [token, id] = process.env.DFFP_DISCORD_DEBUG_URL.split('/').reverse();

  if (route === '$connect') {
    yield* DynamoDBDocument.put({
      TableName: process.env.DDB_OPERATIONS,
      Item     : {
        ...WS_BYPASS_KEY,
        context: event.requestContext,
      },
    });

    yield* DiscordApi.executeWebhookJson(id, token, {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        title      : 'dev: connect',
        description: MD.content(
          MD.h1(process.env.AWS_LAMBDA_FUNCTION_NAME),
          JSON.stringify(event.requestContext, null, 2),
          JSON.stringify(event.body, null, 2),
        ),
      }],
    });

    return {statusCode: 200};
  }

  if (route === '$disconnect') {
    yield* DynamoDBDocument.delete({
      TableName: process.env.DDB_OPERATIONS,
      Key      : WS_BYPASS_KEY,
    });

    yield* DiscordApi.executeWebhookJson(id, token, {
      embeds: [{
        color      : nColor(COLOR.ERROR),
        title      : 'dev: disconnect',
        description: MD.content(
          MD.h1(process.env.AWS_LAMBDA_FUNCTION_NAME),
          JSON.stringify(event.requestContext, null, 2),
          JSON.stringify(event.body, null, 2),
        ),
      }],
    });

    return {statusCode: 200};
  }

  yield* DiscordApi.executeWebhookJson(id, token, {
    embeds: [{
      color      : nColor(COLOR.INFO),
      title      : 'dev: received',
      description: MD.content(
        MD.h1(process.env.AWS_LAMBDA_FUNCTION_NAME),
        JSON.stringify(event.requestContext, null, 2),
        JSON.stringify(event.body, null, 2),
      ),
    }],
  });

  return {
    statusCode: 200,
    body      : JSON.stringify(event),
  } satisfies APIGatewayProxyResultV2;
});

const layer = pipe(
  DiscordLayerLive,
  L.provideMerge(
    DynamoDBDocument.defaultLayer,
  ),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = LambdaHandler.make({
  handler: dev_ws,
  layer  : layer,
});
