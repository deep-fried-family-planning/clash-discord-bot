import {D} from '#src/internals/re-exports/effect.ts';

export class ClashperkError extends D.TaggedError('DeepFryerClashError')<{
    original: Error;
}> {}

export const clashErrorFromUndefined = (e: unknown) => new ClashperkError({original: e as Error});

export class DeepFryerUnknownError extends D.TaggedError('DeepFryerUnknownError')<{
    original: Error;
}> {}
