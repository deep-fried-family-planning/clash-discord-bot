import * as El from '#src/disreact/model/entity/el.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';

export namespace Dsx {}

const connect = (node: El.Nd) => {
  const rests = {} as Record<string, number>;
  const comps = new WeakMap<FC.FC, number>();
  for (let i = 0; i < node.nodes.length; i++) {
    if (!El.isElem(node.nodes[i])) {
      node.nodes[i] = El.text(node.nodes[i]);
    }
    const child = node.nodes[i];
    child.pos = i;
    El.setParent(child, node);
    if (El.isText(child)) {
      continue;
    }
    else if (El.isRest(child)) {
      const idx = rests[child.type] ??= 0;
      child.idx = idx;
      child.ids = `${node.name}:${node.idx}:${child.name}:${child.idx}`;
      rests[child.type]++;
    }
    else {
      const idx = comps.get(child.type) ?? 0;
      child.idx = idx;
      child.ids = `${node.name}:${node.idx}:${child.name}:${child.idx}`;
      comps.set(child.type, idx + 1);
    }
  }
};

export const Fragment = Symbol.for('disreact/Fragment');

export const jsx = (type: any, props: any) => {
  if (type === Fragment) {
    return props.children;
  }

  switch (typeof type) {
    case 'string': {
      const node = El.rest(type, props);
      connect(node);
      return node;
    }
    case 'function': {
      return El.comp(type, props);
    }
  }
  throw new Error(`Invalid JSX type: ${type}`);
};

export const jsxs = (type: any, props: any) => jsx(type, props);

export const jsxDEV = (type: any, props: any) => jsx(type, props);
