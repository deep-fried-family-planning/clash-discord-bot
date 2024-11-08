import {D, E} from '#src/internals/re-exports/effect.ts';

export class SlashError extends D.TaggedError('DeepFryerSlashError')<{
    original: unknown;
}> {}

export class SlashUserError extends D.TaggedError('DeepFryerSlashUserError')<{
    issue    : string;
    original?: unknown;
}> {}

export const replyError = (issue: string) => E.catchAll((e) => new SlashUserError({issue: issue, original: e}));
