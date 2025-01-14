import {D} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export class Critical extends D.TaggedError('CriticalFailure')<{
  why: str;
}> {

}
