import {DEFER_SOURCE, makeResponse, PONG, succeedResponse, validateInteraction} from '#src/discord/interaction.ts';
import {E, L, M, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {makePassServiceLayer, PassService} from 'dev/ws-bypass.ts';
import {InteractionType} from 'dfx/types';

const fn = (event: APIGatewayProxyEventBase<unknown>) =>
  pipe(
    validateInteraction(event),
    E.flatMap((interaction) =>
      pipe(
        M.value(interaction.type),
        M.when(
          M.is(InteractionType.PING), () =>
            succeedResponse(200, PONG),
        ),
        M.when(
          M.is(InteractionType.APPLICATION_COMMAND), () =>
            pipe(
              PassService.routeTo('ix_slash', interaction),
              E.fork,
              E.as(makeResponse(200, DEFER_SOURCE)),
            ),
        ),
        M.whenOr(
          M.is(InteractionType.MESSAGE_COMPONENT),
          M.is(InteractionType.MODAL_SUBMIT), () =>
            pipe(
              PassService.routeTo('ix_menu', interaction),
              E.fork,
              E.as(makeResponse(202)),
            ),
        ),
        M.orElse(() => E.die('Not Implemented')),
      ),
    ),
    E.catchAll((error) => {
      if (
        error._tag === 'NoSuchElementException' ||
        error._tag === 'WebhookParseError'
      ) {
        return succeedResponse(400);
      }
      if (error._tag === 'BadWebhookSignature') {
        return succeedResponse(401);
      }
      return succeedResponse(500);
    }),
    E.catchAllDefect((defect) =>
      pipe(
        succeedResponse(500),
      ),
    ),
  );

const layer = pipe(
  L.mergeAll(
    makePassServiceLayer(),
  ),
);

export const handler = makeLambda({
  handler: fn,
  layer  : layer,
});
