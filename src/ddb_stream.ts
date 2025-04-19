import {E} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';



const h = () => E.gen(function* () {});


export const handler = makeLambda(h);
