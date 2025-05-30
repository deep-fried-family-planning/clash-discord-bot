import {DisReact} from '#src/disreact/DisReact.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Interacting} from '#src/service/Interacting.ts';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const ix_components = (ix: Discord.APIInteraction) =>
  pipe(
    E.fork(Interacting.init(ix)),
    E.flatMap(() => DisReact.respond(ix)),
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    E.provide(Interacting.Fresh),
  );
