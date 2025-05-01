import {DEFER_SOURCE, makeResponse, PONG, succeedResponse} from '#src/discord/interaction.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DiscordVerify} from '#src/service/DiscordVerify.ts';
import {EventRouter} from '#src/service/EventRouter.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {type Interaction, InteractionType} from 'dfx/types';
import {Console} from 'effect';

export const ix_api = (req: APIGatewayProxyEventBase<any>) =>
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
          E.tap(EventRouter.invoke('ix_commands', ix)),
        );
      }
      if (
        ix.type === InteractionType.MESSAGE_COMPONENT ||
        ix.type === InteractionType.MODAL_SUBMIT
      ) {
        return pipe(
          succeedResponse(202),
          E.tap(EventRouter.invoke('ix_components', ix)),
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
  );
