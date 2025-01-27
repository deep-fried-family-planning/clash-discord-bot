/* eslint-disable @typescript-eslint/no-empty-object-type */
import {D} from '#src/internal/pure/effect.ts';



export class Critical extends D.TaggedError('DisReact.CriticalFailure')<{

}> {}
