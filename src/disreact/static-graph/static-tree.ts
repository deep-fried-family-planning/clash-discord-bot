import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';


type Callback = (node: DisReactAbstractNode) => void;


export const staticRender = (root: DisReactAbstractNode, beforeRender?: Callback, afterRender?: Callback): void => {
  const renderNode = (node: DisReactAbstractNode): void => {
    if (beforeRender) beforeRender(node);

    node.mount();

    const next = node.render(node.props);

    node.dismount();

    for (let i = 0; i < node.nodes.length; i++) {
      const child = node.nodes[i];
      child.setParent(node, i);
      renderNode(child);
    }

    if (afterRender) afterRender(next);
  };

  renderNode(root);
};
