import type {DeveloperMessage, UserMessage} from '#discord/z-errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export class DatabaseError extends D.TaggedError('DatabaseError')<{
  user     : UserMessage;
  dev      : DeveloperMessage;
  message  : str;
  original?: Error;
  ix?      : IxD;
}> {}
