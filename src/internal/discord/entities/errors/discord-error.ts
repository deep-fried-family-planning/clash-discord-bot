import type {DeveloperMessage, UserMessage} from '#discord/entities/errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export class DiscordError extends D.TaggedError('DiscordError')<{
  user     : UserMessage;
  dev      : DeveloperMessage;
  message  : str;
  original?: Error;
  ix?      : IxD;
}> {}
