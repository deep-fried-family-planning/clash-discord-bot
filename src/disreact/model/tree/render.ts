
import type {HookState} from '#src/disreact/model/hooks/hook-state.ts';
import {areNodesEqual, arePropsShallowEqual, type DisReactNode} from '#src/disreact/model/tree/node.ts';
import type {rec} from '#src/internal/pure/pure.ts';



export const renderTree = (node: DisReactNode, states?: rec<HookState>): DisReactNode => {
  if (states && node.name in states) {
    node.state = states[node.name];
  }
  const renderedNode = node.render(node.props);

  if (!arePropsShallowEqual(node.props, renderedNode.props)) {
    node.dismount();
    renderedNode.mount();
  }
  else {
    node.setProps(renderedNode.props);
  }

  for (let i = 0; i < renderedNode.nodes.length; i++) {
    const newChild     = renderedNode.nodes[i];
    const currentChild = node.nodes[i];

    if (areNodesEqual(currentChild, newChild)) {
      currentChild.setProps(newChild.props);
      renderedNode.nodes[i] = renderTree(currentChild);
    }
    else {
      renderedNode.nodes[i] = renderTree(newChild);
      renderedNode.nodes[i].setParent(renderedNode, i);
    }
  }

  if (node.parent) {
    renderedNode.setParent(node.parent, node.index);
  }

  return renderedNode;
};
