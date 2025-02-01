import {Critical} from '#src/disreact/runtime/service/debug.ts';
import {createRootElement} from '#src/disreact/model/dsx/create-element.ts';
import {cloneTree, createRootMap} from '#src/disreact/model/traversal.ts';
import type {TagFunc} from '#src/disreact/model/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';

const make = (initial: TagFunc[]) => E.gen(function * () {
  const rootElements = initial.map((type) => createRootElement(type, {}));
  const rootMap      = createRootMap(rootElements);

  return {
    checkout: (root: string, node: string) => E.gen(function * () {
      if (!(root in rootMap)) {
        return yield * new Critical({why: `${root}/${node}: Root not found`});
      }
      if (!(node in rootMap[root])) {
        return yield * new Critical({why: `${root}/${node}: Node not found`});
      }
      return cloneTree(rootMap[root][node], true);
    }),
  };
});

export class StaticDOM extends E.Tag('DisReact.StaticDOM')<
  StaticDOM,
  EAR<typeof make>
>() {
  static makeLayer = (types: TagFunc[]) => L.effect(this, make(types));
}
