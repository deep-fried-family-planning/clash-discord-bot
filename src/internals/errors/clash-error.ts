import {D} from '#src/internals/re-exports/effect.ts';

export class ClashError extends D.TaggedError('DeepFryerClashError')<{
    original: Error;
}> {}

export const clashErrorFromUndefined = (e: unknown) => new ClashError({original: e as Error});
