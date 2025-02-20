import {Impossible} from '#src/disreact/codec/debug.ts';
import type {Pragma} from '#src/disreact/dsx/lifecycle.ts';



type PropsS = {children?: Pragma | null} | null;
type PropsM = {children: Pragma[]};



export const fragment = undefined;

export const dsxRuntime = (type: JSX.ElementType, props: PropsS = {}): Pragma | Pragma[] => {
  if (!props) {
    return dsxs(
      type,
      {children: []},
    );
  }

  if (!props.children) {
    return dsxs(
      type,
      {...props, children: []},
    );
  }

  if (Array.isArray(props.children)) {
    return dsxs(
      type,
      {...props, children: props.children.flat()},
    );
  }

  return dsxs(
    type,
    {...props, children: [props.children]},
  );
};

export const dsxs = (type: JSX.ElementType, props: PropsM): Pragma | Pragma[] => {
  const children = props.children.flat();
  // @ts-expect-error convenience lol
  delete props.children;

  switch (typeof type) {
  case 'undefined':
    return children;

  case 'string':
    return {
      kind    : 'intrinsic',
      name    : type as keyof JSX.IntrinsicElements,
      index   : 0,
      id      : '',
      id_step : '',
      id_full : '',
      props   : props,
      children: connectIntrinsicChildren(children),
    };

  case 'function':
    return {
      kind    : 'function',
      name    : type.name,
      index   : 0,
      id      : '',
      id_step : '',
      id_full : '',
      props   : props,
      children: [],
      render  : type,
    };

  case 'boolean':
  case 'number':
  case 'bigint':
  case 'symbol':
    return {
      kind    : 'text',
      name    : 'string',
      index   : 0,
      id      : '',
      id_step : '',
      id_full : '',
      value   : String(type),
      children: [],
    };
  }
  throw new Error(`Unknown Tag: ${type}`);
};



const connectIntrinsicChildren = (children: (Pragma | string)[]) => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = {
        kind    : 'text',
        name    : 'string',
        index   : i,
        id      : `string:${i}`,
        id_step : '',
        id_full : '',
        value   : c,
        children: [],
      };
    }
    else {
      c.index     = i;
      c.id        = `${c.name}:${i}`;
    }

    children[i] = c;
  }

  return children as Pragma[];
};



export const dsxid = <T extends Pragma>(node: T, parent?: Pragma): T => {
  if (!parent) {
    node.index   = 0;
    node.id      = `${node.name}:${node.index}`;
    node.id_step = `${node.name}:${node.index}`;
    node.id_full = `${node.name}:${node.index}`;
    node.isRoot  = true;
  }
  else {
    node.id      = `${node.name}:${node.index}`;
    node.id_step = `${parent.id}:${node.id}`;
    node.id_full = `${parent.id_full}:${node.id}`;
  }
  return node;
};
