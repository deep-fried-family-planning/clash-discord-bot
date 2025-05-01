import {DEFER_SOURCE, makeResponse, PONG, succeedResponse} from '#src/discord/interaction.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DiscordVerify, DiscordVerifyLive} from '#src/lambdas/service/DiscordVerify.ts';
import {EventRouter, EventRouterLive} from '#src/lambdas/service/EventRouter.ts';
import {makeLambdaRuntime} from '#src/lambdas/util.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {type Interaction, InteractionType} from 'dfx/types';
import {Console, Layer} from 'effect';

const runtime = makeLambdaRuntime(
  Layer.mergeAll(
    EventRouterLive,
    DiscordVerifyLive,
  ),
);

export const handler = async (req: APIGatewayProxyEventBase<any>) => await runtime(
  pipe(
    DiscordVerify.isVerified(req),
    E.flatMap((isVerified) => {
      if (!isVerified) {
        return succeedResponse(401);
      }

      const ix = JSON.parse(req.body!) as Interaction;

      if (ix.type === InteractionType.PING) {
        return succeedResponse(200, PONG);
      }
      if (ix.type === InteractionType.APPLICATION_COMMAND) {
        return pipe(
          succeedResponse(200, DEFER_SOURCE),
          E.tap(EventRouter.invoke('ix_slash', ix)),
        );
      }
      if (
        ix.type === InteractionType.MESSAGE_COMPONENT ||
        ix.type === InteractionType.MODAL_SUBMIT
      ) {
        return pipe(
          succeedResponse(202),
          E.tap(EventRouter.invoke('ix_menu', ix)),
        );
      }
      return E.die('Not Implemented');
    }),
    E.catchAllDefect((defect) =>
      pipe(
        Console.error(defect),
        E.as(makeResponse(500)),
      ),
    ),
  ),
);
