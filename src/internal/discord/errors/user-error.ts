import type {DeveloperMessage, UserMessage} from '#discord/errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export class UserError extends D.TaggedError('UserError')<{
    user     : UserMessage;
    dev      : DeveloperMessage;
    message  : str;
    original?: Error;
    ix?      : IxD;
}> {}
