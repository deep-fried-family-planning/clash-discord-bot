import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Interacting} from '#src/service/Interacting.ts';
import type {Interaction} from 'dfx/types';

export const ix_components = (ix: Interaction) =>
  pipe(
    E.fork(Interacting.init(ix)),
    E.flatMap(() => DisReact.respond(ix)),
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    E.provide(Interacting.Fresh),
  );
