
import {cloneTree, staticRender} from '#src/disreact/model/lifecycles.ts';
import {type DisReactNode, FunctionNode} from '#src/disreact/model/node.ts';



export type RootMap = { [k in string]: { [k in string]: DisReactNode } };


export const createRootMap = (roots: DisReactNode[], rootMaps: RootMap = {}) => {
  for (const root of roots) {
    if (root.name in rootMaps) throw new Error('Duplicate root name: ' + root.name);

    rootMaps[root.name] = {};

    let latch = 0;

    staticRender(
      root,
      () => {},
      (rendered) => {
        if (latch === 0) {
          latch = 1;
        }
        else {
          recurse(rendered, root, rootMaps);
        }
      },
    );
  }

  return rootMaps;
};


const recurse = (rendered: DisReactNode, root: DisReactNode, rootMaps: RootMap): void => {
  if (!rendered.switches) return;

  const nodes = rendered.switches;

  rendered.setRootMapParent(root);
  rootMaps[root.name][rendered.name] = rendered;

  for (const node in nodes) {
    if (node in rootMaps[root.name]) throw new Error('Duplicate node name: ' + node);

    const tree = new FunctionNode(nodes[node], {});

    tree.setRootMapParent(root);

    staticRender(
      tree,
      () => {},
      (rendered) => {
        recurse(rendered, root, rootMaps);
      },
    );

    rootMaps[root.name][node] = tree;
  }
};


export const originalFromRootMap = (rootMap: RootMap, root: string, name: string): DisReactNode => {
  if (!(root in rootMap)) throw new Error('Root not found: ' + root);
  if (!(name in rootMap[root])) throw new Error('Node not found: ' + name);
  return rootMap[root][name];
};


export const cloneFromRootMap = (rootMap: RootMap, root: string, name: string): DisReactNode => {
  if (!(root in rootMap)) throw new Error('Root not found: ' + root);
  if (!(name in rootMap[root])) throw new Error('Node not found: ' + name);
  return cloneTree(rootMap[root][name]);
};
