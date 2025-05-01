import {ix_api} from '#src/lambdas/ix_api.ts';
import {DiscordVerifyLive} from '#src/service/DiscordVerify.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {makeLambdaRuntime} from '#src/lambdas/util.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {Layer} from 'effect';

const runtime = makeLambdaRuntime(
  Layer.mergeAll(
    EventRouterLive,
    DiscordVerifyLive,
  ),
);

export const handler = async (req: APIGatewayProxyEventBase<any>) => await runtime(
  ix_api(req),
);
