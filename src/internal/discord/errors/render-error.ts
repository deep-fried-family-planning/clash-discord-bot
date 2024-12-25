import type {DeveloperMessage, UserMessage} from '#discord/errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#src/internal/pure/effect.ts';


export class RenderError extends D.TaggedError('RenderError')<{
    user?    : UserMessage;
    dev?     : DeveloperMessage;
    original?: Error;
    ix?      : IxD;
}> {}
