import {E, g} from '#pure/effect';
import {Auth, type Node, VDocument} from '#src/internal/disreact/entity/index.ts';
import {annotateLifeCycle} from '#src/internal/disreact/runtime/helpers.ts';
import {MemoryStore} from '#src/internal/disreact/runtime/layers/memory-store.ts';


const annotations = annotateLifeCycle('intermediateRender');


export const intermediateRender = (node: Node.Node) => g(function * () {
  yield * E.logTrace(`[render]`);

  const rendered = node.render();

  if (node.needsAuth) {
    yield * E.logTrace(`[intermediateRender]: auth required`);

    const auths = yield * MemoryStore.getAuths();

    rendered.components = rendered.components.map((row) => row.filter((component) => {
      if (!component.auths?.length) return true;
      return Auth.hasAllAuths(auths, component.auths);
    }));
  }

  return yield * MemoryStore.update(VDocument.attachElement(rendered));
}).pipe(
);
