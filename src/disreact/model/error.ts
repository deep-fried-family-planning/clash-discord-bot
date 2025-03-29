import {Data} from 'effect'



export class DiscordApiError extends Data.TaggedError('DisReact.DiscordApiError')<{
  cause: Error
}> {}

export class DisReactCodecError extends Data.TaggedError('DisReact.DisReactCodecError')<{
  stage : 'encode' | 'decode'
  cause?: Error
  why?  : string
}> {}

export class BadInteraction extends Data.TaggedError('DisReact.BadInteraction')<{
  why?  : string
  cause?: Error | string
}> {}

export class DokenError extends Data.TaggedError('DisReact.DokenError')<{}> {}

export class DokenMemoryError extends Data.TaggedError('DisReact.DokenMemoryError')<{
  cause?: any
}> {}

export class HookError extends Data.TaggedError('DisReact.HookError')<{
  message: string
}> {}

export class LawOfHooksError extends Data.TaggedError('DisReact.LawOfHooksError')<{}> {}
