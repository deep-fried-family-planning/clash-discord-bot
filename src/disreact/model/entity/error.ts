import {D} from '#src/disreact/utils/re-exports.ts';
import {Data} from 'effect';

export class RenderDefect extends Data.TaggedError('disreact/RenderDefect')<{
  cause?: unknown;
}> {}

export class TriggerDefect extends D.TaggedError('disreact/TriggerDefect')<{
  cause: unknown;
}> {}
