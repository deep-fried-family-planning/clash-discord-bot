import {Data} from 'effect';

export class DiscordApiError extends Data.TaggedError('DisReact.DiscordApiError')<{
  cause: Error;
}> {}

export class DisReactCodecError extends Data.TaggedError('DisReact.DisReactCodecError')<{
  stage: 'encode' | 'decode';
  cause: Error;
}> {}

export class StaticDOMError extends Data.TaggedError('DisReact.StaticDOMError')<{
  cause: Error;
}> {}

export class DokenMemoryError extends Data.TaggedError('DisReact.DokenMemoryError')<{
  cause: Error;
}> {}
