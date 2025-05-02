import {commandRouter} from '#src/discord/command-router.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Interacting} from '#src/service/Interacting.ts';

export const ix_commands = (ix: IxD) =>
  pipe(
    E.fork(Interacting.init(ix)),
    E.flatMap(() => commandRouter(ix)),
    E.tapError((error) => DeepFryerLogger.logError(error)),
    E.tapDefect((defect) => DeepFryerLogger.logFatal(defect)),
    E.provide(Interacting.Fresh),
  );
