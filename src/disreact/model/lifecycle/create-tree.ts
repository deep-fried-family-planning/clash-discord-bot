import {type NodeTree, RenderNode} from '#src/disreact/model/lifecycle/node.ts';
import {Critical} from '#src/disreact/runtime/service/debug.ts';


export const createTreeFromRoot = (dsx: DSX.Element): NodeTree => {
  if (typeof dsx.type !== 'function')
    throw new Critical({why: 'Invalid root element'});

  const root = new RenderNode(dsx);
  root.isRoot = true;
  root.
};


const createTree = (dsx: DSX.Element): NodeTree => {
  return createTreeFromRoot(dsx);
};
