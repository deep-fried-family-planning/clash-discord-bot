import {D} from '#src/utils/effect.ts';

export class DynamoError extends D.TaggedError('DeepFryerDynamoError')<{
    message  : string;
    original?: unknown;
}> {}
