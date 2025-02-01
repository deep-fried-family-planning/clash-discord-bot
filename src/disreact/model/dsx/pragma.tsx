/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-base-to-string,@typescript-eslint/restrict-template-expressions */

type PropsS = {children?: DSX.ElementType | null} | null;
type PropsM = {children: JSX.ElementType[]};

export const __Fragment = undefined;

export const _jsx = (type: JSX.ElementType, props: PropsS = {}): DSX.Node => {
  if (!props)
    return _jsxs(type, {children: []});

  if (!props.children)
    return _jsxs(type, {...props, children: []});

  if (Array.isArray(props.children))
    return _jsxs(type, {...props, children: props.children.filter(Boolean).flat()});

  return _jsxs(type, {...props, children: [props.children]});
};

export const _jsxs = (type: JSX.ElementType, props: PropsM): DSX.Node => {
  const children = props.children;

  switch (typeof type) {
    case 'function':
      return {type, props: {...props, children: type(props)}};

    case 'undefined':
      return props.children;

    case 'object':
      if (type === null)
        return [];

      if (!Array.isArray(type)) {
        return [];
      }

      if (!type.length)
        return [];

      if (type.length === 1)
        return type[0];

      else
        return type.filter(Boolean).flat() as DSX.Node[];

    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
      return [String(type)];

    case 'string':
      return {type, props};
  }
};


export type NodeTree =
  | TextNode
  | MarkdownNode
  | IntrinsicNode
  | RenderNode;

abstract class NodeStruct {
  public _tag       = '';
  public tag        = '';
  public props      = {} as Record<string, any> & {children: DSX.Node[]};
  public custom_id  = '';
  public index      = 0;
  public name       = '';
  public id         = '';
  public step_id    = '';
  public full_id    = '';
  public parentNode = this;
  public childNodes = [] as NodeTree[];

  public constructor(type: JSX.ElementType, props: PropsM) {

  }
}

export class TextNode extends NodeStruct {
  _tag = 'text' as const;
}

export class MarkdownNode extends NodeStruct {
  _tag = 'markdown' as const;
}

export class IntrinsicNode extends NodeStruct {
  _tag = 'intrinsic' as const;
}

export class RenderNode extends NodeStruct {
  _tag = 'function' as const;
}
