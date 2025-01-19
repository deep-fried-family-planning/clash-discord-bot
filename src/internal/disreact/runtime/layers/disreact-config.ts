import {E, L} from '#pure/effect';
import type {EAR} from '#src/internal/types.ts';


const configure = E.fn('DisReactConfig')(
  function * () {
    return {};
  },
);


export class DisReactConfig extends E.Tag('DisReactConfig')<
  DisReactConfig,
  EAR<typeof configure>
>() {
  static makeLayer = () => L.effect(this, configure());
}
