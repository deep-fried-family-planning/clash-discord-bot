import {g} from '#pure/effect';
import {Auth, type Node, VDocument} from '#src/internal/disreact/entity/index.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';


export const intermediateRender = (
  node: Node.Node,
) => g(function * () {
  const rendered = node.render();

  if (node.needsAuth) {
    const auths = yield * MemoryStore.getAuths();

    rendered.components = rendered.components.map((row) => row.filter((component) => {
      if (!component.auths?.length) return true;
      return Auth.hasAllAuths(auths, component.auths);
    }));
  }

  return yield * MemoryStore.update(VDocument.attachElement(rendered));
});
