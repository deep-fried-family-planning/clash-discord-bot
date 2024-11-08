import {D} from '#src/internals/re-exports/effect.ts';

export class DynamoError extends D.TaggedError('DeepFryerDynamoError')<{
    message  : string;
    original?: unknown;
}> {}
