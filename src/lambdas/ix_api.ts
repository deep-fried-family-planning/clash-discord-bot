import {DEFER_SOURCE, makeResponse, PONG, succeedResponse} from '#src/discord/interaction.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {makeLambdaRuntime} from '#src/lambdas/util.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {type Interaction, InteractionType} from 'dfx/types';
import {Console} from 'effect';
import {PassService, PassServiceLayer, VerificationService, VerificationServiceLayer} from 'scripts/dev/ws-bypass.ts';

const runtime = makeLambdaRuntime(
  L.mergeAll(
    PassServiceLayer,
    VerificationServiceLayer,
  ),
);

export const handler = async (req: APIGatewayProxyEventBase<any>) => await runtime(
  pipe(
    VerificationService.use((vs) => vs.verify(req)),
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
          E.tap(PassService.routeTo('ix_slash', ix)),
        );
      }
      if (
        ix.type === InteractionType.MESSAGE_COMPONENT ||
        ix.type === InteractionType.MODAL_SUBMIT
      ) {
        return pipe(
          succeedResponse(202),
          E.tap(PassService.routeTo('ix_menu', ix)),
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
