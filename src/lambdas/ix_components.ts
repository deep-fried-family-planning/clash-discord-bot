import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import type {Interaction} from 'dfx/types';

export const ix_components = (ix: Interaction) =>
  pipe(
    DisReact.respond(ix),
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
  );
