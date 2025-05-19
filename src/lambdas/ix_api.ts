import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouter} from '#src/service/EventRouter.ts';
import {InteractionVerify} from '#src/service/InteractionVerify.ts';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import type {Discord} from 'dfx';
import {InteractionCallbackTypes, InteractionTypes} from 'dfx/types';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

const PONG = {type: InteractionCallbackTypes.PONG};
const DEFER_SOURCE = {type: InteractionCallbackTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE};

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

export const ix_api = (req: APIGatewayProxyEventBase<any>) =>
  pipe(
    InteractionVerify.isVerified(req),
    E.flatMap((isVerified) => {
      if (!isVerified) {
        return succeedResponse(401);
      }

      const ix = JSON.parse(req.body!) as Discord.APIInteraction;

      if (ix.type === InteractionTypes.PING) {
        return succeedResponse(200, PONG);
      }
      if (ix.type === InteractionTypes.APPLICATION_COMMAND) {
        return pipe(
          succeedResponse(200, DEFER_SOURCE),
          E.tap(EventRouter.invoke('ix_commands', ix)),
        );
      }
      if (
        ix.type === InteractionTypes.MESSAGE_COMPONENT ||
        ix.type === InteractionTypes.MODAL_SUBMIT
      ) {
        return pipe(
          succeedResponse(202),
          E.tap(EventRouter.invoke('ix_components', ix)),
        );
      }
      return E.die('Not Implemented');
    }),
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    E.catchAllDefect(() => succeedResponse(500)),
  );
