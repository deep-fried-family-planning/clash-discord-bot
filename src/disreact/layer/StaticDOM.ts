import {createRootElement} from '#src/disreact/dsx/create-element.ts';
import type {TagFunc} from '#src/disreact/dsx/types';
import {cloneFromRootMap, createRootMap} from '#src/disreact/model/static-graph/root-map.ts';
import {E, g, L} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';



const program = (types: TagFunc[]) => E.gen(function * () {
  const cached = E.sync(
    () => {
      const rootElements = types.map((type) => createRootElement(type, {}));
      return createRootMap(rootElements);
    },
  );

  const rootElements = types.map((type) => createRootElement(type, {}));

  const rootMap = createRootMap(rootElements);

  return {
    cloneNode: (root: string, node: string) => g(function * () {
      return cloneFromRootMap(rootMap, root, node);
    }),
  };
});



export class StaticDOM extends E.Tag('DisReact.StaticDOM')<
  StaticDOM,
  EAR<typeof program>
>() {
  static makeLayer = (types: TagFunc[]) => L.effect(this, program(types));
}
