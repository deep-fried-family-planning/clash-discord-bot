import {Data} from 'effect';



export class DisReactCodecError extends Data.TaggedError('DisReact.DisReactCodecError')<{
  stage: 'encode' | 'decode';
}> {}


export class DiscordApiError extends Data.TaggedError('DisReact.DiscordApiError')<{

}> {}


export class StaticDOMError extends Data.TaggedError('DisReact.StaticDOMError')<{}> {

}


export class DokenMemoryError extends Data.TaggedError('DisReact.DokenMemoryError')<{

}> {}
