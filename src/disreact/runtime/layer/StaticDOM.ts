import {createRootElement} from '#disreact/dsx/create-element.ts';
import type {TagFunc} from '#disreact/dsx/types.ts';
import {cloneFromRootMap, createRootMap} from '#disreact/model/root-map.ts';
import {Token} from '#disreact/api/index.ts';
import {C, E, g, L} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/virtual/entities/dapi.ts';
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
