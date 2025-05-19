import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import type {SQSEvent} from 'aws-lambda';
import * as E from 'effect/Effect';

export const task = E.fn(
  function* (event: SQSEvent) {

  },
  E.tapError((error) => DeepFryerLogger.logError(error)),
  E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
);
