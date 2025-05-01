import {commandRouter} from '#src/discord/command-router.ts';
import {Interacting} from '#src/discord/Interacting.ts';
import type {IxD, IxRE} from '#src/internal/discord-old/discord.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Cause} from 'effect';

export const ix_commands = (ix: IxD) => pipe(
  Interacting.init(ix),
  E.flatMap(() => commandRouter(ix)),
  E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function* () {
    const userMessage = yield* logDiscordError([e]);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        title: e.issue,
      }],
    } as Partial<IxRE>);
  })),
  E.catchTag('ClashKingError', (e) => E.gen(function* () {
    const userMessage = yield* logDiscordError([e]);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        // @ts-expect-error temporary
        title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
      }],
    } as Partial<IxRE>);
  })),
  E.catchAllCause((error) => E.gen(function* () {
    const e = Cause.prettyErrors(error);

    const userMessage = yield* logDiscordError(e);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, userMessage);
  })),
  E.provide(Interacting.Fresh),
);
