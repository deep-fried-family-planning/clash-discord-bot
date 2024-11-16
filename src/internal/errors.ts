import {D, E} from '#src/internal/pure/effect.ts';


export class DynamoError extends D.TaggedError('DeepFryerDynamoError')<{
    message  : string;
    original?: unknown;
}> {}


export class ClashperkError extends D.TaggedError('DeepFryerClashError')<{
    original: Error;
}> {}


export const clashErrorFromUndefined = (e: unknown) => new ClashperkError({original: e as Error});


export class DeepFryerUnknownError extends D.TaggedError('DeepFryerUnknownError')<{
    issue?   : string;
    original?: Error;
}> {}


export class SlashError extends D.TaggedError('DeepFryerSlashError')<{
    original: unknown;
}> {}


export class SlashUserError extends D.TaggedError('DeepFryerSlashUserError')<{
    issue    : string;
    original?: unknown;
}> {}


export const replyError = (issue: string) => E.catchAll((e) => new SlashUserError({issue: issue, original: e}));
