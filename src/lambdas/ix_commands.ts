import {commandRouter} from '#src/command-router.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Interacting} from '#src/service/Interacting.ts';
import type {Discord} from 'dfx';

export const ix_commands = (ix: Discord.APIInteraction) =>
  pipe(
    E.fork(Interacting.init(ix)),
    E.flatMap(() => commandRouter(ix)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    E.provide(Interacting.Fresh),
  );
