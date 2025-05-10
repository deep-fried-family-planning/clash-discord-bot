import * as Data from 'effect/Data';
import * as E from 'effect/Effect';

export class SlashUserError extends Data.TaggedError('DeepFryerSlashUserError')<{
  issue    : string;
  original?: unknown;
  cause?   : any;
}> {}

export const replyError = (issue: string) => E.catchAll((e) => new SlashUserError({issue: issue, original: e}));
