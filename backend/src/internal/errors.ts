import * as E from 'effect/Effect';
import * as D from 'effect/Data';

export class SlashError extends D.TaggedError('DeepFryerSlashError')<{
  issue?  : string;
  original: unknown;
}> {
}

export class SlashUserError extends D.TaggedError('DeepFryerSlashUserError')<{
  issue    : string;
  original?: unknown;
  cause?   : any;
}> {}

export const replyError = (issue: string) => E.catchAll((e) => new SlashUserError({issue: issue, original: e}));
