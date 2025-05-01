import {DEFER_SOURCE, makeResponse, PONG, succeedResponse} from '#src/discord/interaction.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeLambdaRuntime} from '#src/lambdas/util.ts';
import {EventRouter, EventRouterLive} from '#src/lambdas/service/EventRouter.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {type Interaction, InteractionType} from 'dfx/types';
import {PlatformAlgorithm, verify} from 'discord-verify';
import {Console} from 'effect';
import {subtle} from 'node:crypto';

const runtime = makeLambdaRuntime(
  EventRouterLive,
);

export const handler = async (req: APIGatewayProxyEventBase<any>) => await runtime(
  pipe(
    E.promise(() =>
      verify(
        req.body,
        req.headers['x-signature-ed25519'],
        req.headers['x-signature-timestamp'],
        process.env.DFFP_DISCORD_PUBLIC_KEY,
        subtle,
        PlatformAlgorithm.NewNode,
      ),
    ),
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
