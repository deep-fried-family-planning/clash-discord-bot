/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions */

import {DFMD, DTML} from '#src/disreact/model/dsx/html.ts';
import console from 'node:console';
import { DTML } from './html';
import {Critical} from '#src/disreact/runtime/service/debug.ts';

abstract class NodeStruct {
  _tag       = '';
  custom_id  = '';
  index      = 0;
  name       = '';
  id         = '';
  step_id    = '';
  full_id    = '';
  props      = {} as Record<string, any> & {children: DSX.Node[]};
  parentNode = this;
  childNodes = [] as NodeTree[];
}

export type NodeTree =
  | TextNode
  | MarkdownNode
  | IntrinsicNode
  | RenderNode;

type PropsS = {children?: NodeTree | null} | null;
type PropsM = {children: NodeTree[]};

export const __Fragment = undefined;

export const _jsx = (type: JSX.ElementType, props: PropsS = {}): NodeTree | NodeTree[] => {
  if (!props)
    return _jsxs(type, {children: []});

  if (!props.children)
    return _jsxs(type, {...props, children: []});

  if (Array.isArray(props.children))
    return _jsxs(type, {...props, children: props.children.filter(Boolean).flat()});

  return _jsxs(type, {...props, children: [props.children]});
};

export const _jsxs = (type: JSX.ElementType, props: any): NodeTree | NodeTree[] => {
  if (!type)
    return props.children;

  if (typeof type === 'function') {
    const renderNode = new RenderNode(type as any, props)
    const childNodes = type(props) as NodeTree | NodeTree[];

    if (Array.isArray(childNodes)) {
      const nodes = childNodes.filter(Boolean).flat();
      for (let i = 0; i < nodes.length; i++) {
        const child = nodes[i];
        child.index = i;
        child.parentNode = renderNode;
        renderNode.childNodes.push(child);
      }
    }
    else {
      const child = childNodes;
      child.index = 0;
      child.parentNode = renderNode;
      renderNode.childNodes.push(child);
    }
    return renderNode
  }

  const {children: _, ...config} = props;

  const parent = createNode(type, config);
  const children = props.children.flat();

  for (let i = 0; i < children.length; i++) {
    const child      = typeof children[i] === 'string' ? createNode(children[i]) : children[i];
    child.index      = i;
    child.parentNode = parent;
    parent.childNodes.push(child);
  }

  return parent;
};

const createNode = (type: JSX.ElementType, props: any): NodeTree => {
  switch (typeof type) {
    case 'object':
    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
      return new TextNode(String(type));
    case 'string':
      if (type in DTML) {
        return new IntrinsicNode()
      }
      if (type in DFMD) {
        return new MarkdownNode()
      }
      return new TextNode(type);
  }
  throw new Critical({why: 'Invalid type'});
};

export class RenderNode extends NodeStruct {
  _tag = 'function' as const;
  render: (props: any) => any
  constructor(type: (props: any) => any, props: any) {
    super();
    this.name = type.name;
    this.render = type;
    this.props = props;
  }
}

export class IntrinsicNode extends NodeStruct {
  _tag = 'intrinsic' as const;
}

export class MarkdownNode extends NodeStruct {
  _tag = 'markdown' as const;
  constructor() {
    super();
  }
}

export class TextNode extends NodeStruct {
  _tag = 'text' as const;
  text = '';
  constructor(text: string) {
    super();
    this.text = text;
  }
}
