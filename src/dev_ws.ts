import {makeLambda} from '@effect-aws/lambda';
import {g, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {APIGatewayProxyWebsocketEventV2} from 'aws-lambda';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {MD} from './internal/pure/pure';
import type {APIGatewayProxyResultV2} from 'aws-lambda/trigger/api-gateway-proxy';


export type WsCtx = APIGatewayProxyWebsocketEventV2['requestContext'];


const h = (event: APIGatewayProxyWebsocketEventV2) => g(function * () {
    const route = event.requestContext.routeKey;

    const [token, id] = process.env.DFFP_DISCORD_DEBUG_URL.split('/').reverse();

    yield * DiscordApi.executeWebhookJson(id, token, {
        embeds: [{
            color      : nColor(COLOR.SUCCESS),
            title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
            description: MD.content(
                JSON.stringify(event.requestContext, null, 2),
                JSON.stringify(event.body, null, 2),
            ),
        }],
    });

    if (route === '$connect') {
        yield * DynamoDBDocument.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : {
                pk     : 'dev_ws',
                sk     : 'now',
                context: event.requestContext,
            },
        });

        return {statusCode: 200};
    }

    if (route === '$disconnect') {
        yield * DynamoDBDocument.delete({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
                pk: 'dev_ws',
                sk: 'now',
            },
        });

        return {statusCode: 200};
    }

    return {
        statusCode: 200,
        body      : JSON.stringify(event),
    } satisfies APIGatewayProxyResultV2;
});


const live = pipe(
    DiscordLayerLive,
    L.provideMerge(L.mergeAll(
        DynamoDBDocument.defaultLayer,
    )),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, live);
