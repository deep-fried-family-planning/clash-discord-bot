import type {DeveloperMessage, UserMessage} from '#discord/entities/errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#pure/effect';


export class RenderError extends D.TaggedError('RenderError')<{
  user?    : UserMessage;
  dev?     : DeveloperMessage;
  original?: Error;
  ix?      : IxD;
}> {}
