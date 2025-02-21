import {Data} from 'effect';

export class DiscordApiError extends Data.TaggedError('DisReact.DiscordApiError')<{
  cause: Error;
}> {}

export class DisReactCodecError extends Data.TaggedError('DisReact.DisReactCodecError')<{
  stage: 'encode' | 'decode';
  cause: Error;
}> {}

export class BadInteraction extends Data.TaggedError('DisReact.BadInteraction')<{
  why?  : string;
  cause?: Error | string;
}> {}

export class StaticGraphError extends Data.TaggedError('DisReact.StaticGraphError')<{
  cause?: Error;
  why?  : string;
}> {}

export class DokenMemoryError extends Data.TaggedError('DisReact.DokenMemoryError')<{
  cause: Error;
}> {}
