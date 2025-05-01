import {E, pipe} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouter} from '#src/service/EventRouter.ts';
import {InteractionVerify} from '#src/service/InteractionVerify.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {type Interaction, InteractionCallbackType, InteractionType} from 'dfx/types';
import {Console} from 'effect';

const PONG = {type: InteractionCallbackType.PONG};
const DEFER_SOURCE = {type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE};

const succeedResponse = (code: number, body?: any) => {
  if (!body) {
    return E.succeed({
      statusCode: code,
    });
  }
  return E.succeed({
    statusCode: code,
    body      : JSON.stringify(body),
  });
};

const makeResponse = (code: number, body?: any) => {
  if (!body) {
    return {
      statusCode: code,
    };
  }
  return {
    statusCode: code,
    body      : JSON.stringify(body),
  };
};

export const ix_api = (req: APIGatewayProxyEventBase<any>) =>
  pipe(
    InteractionVerify.isVerified(req),
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
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
  );
