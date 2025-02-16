import * as E from 'effect/Effect';
import {Refinement} from 'effect/Predicate';
import type { Out, Routing } from './schema';



export class Codec extends E.Tag('Effect')<
  Codec,
  {
    encodeDialog: (data: ) => E.Effect<Out.DialogOut>;
  }
>() {

}
