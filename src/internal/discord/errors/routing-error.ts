import type {DeveloperMessage, UserMessage} from '#discord/errors/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {D} from '#src/internal/pure/effect.ts';


export class RoutingError extends D.TaggedError('RoutingError')<{
    user?    : UserMessage;
    dev?     : DeveloperMessage;
    original?: Error;
    ix?      : IxD;
}> {}
