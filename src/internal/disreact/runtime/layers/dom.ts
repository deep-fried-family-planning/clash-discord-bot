import {E, g, L} from '#pure/effect';
import type {EA} from '#src/internal/types.ts';


const dom = g(function * () {
  return {
    allocate: () => {
    },
  };
});


export class DOMInstance extends E.Tag('DOM')<
  DOMInstance,
  EA<typeof dom>
>() {
  static makeInstance = () => L.effect(this, dom);
}
