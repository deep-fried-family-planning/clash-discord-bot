import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import * as Cron from 'effect/Cron';
import * as E from 'effect/Effect';

const raidWeekend = Cron.make({
  days    : [],
  hours   : [],
  minutes : [],
  months  : [],
  weekdays: [5, 6, 7, 0],
});

export const poll = () => E.gen(function* () {

}).pipe(
  E.tapError((error) => DeepFryerLogger.logError(error)),
  E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
);
