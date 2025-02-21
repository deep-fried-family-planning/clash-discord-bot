/* eslint-disable no-case-declarations */
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as FunctionElement from '#src/disreact/codec/schema/entities/function-element.ts';
import * as IntrinsicElement from '#src/disreact/codec/schema/entities/intrinsic-element.ts';
import * as TextElement from '#src/disreact/codec/schema/entities/text-element.ts';



type PropsS = {children?: Pragma | null} | null;
type PropsM = {children: Pragma[]};



export const fragment = undefined;

export const dsx = (type: JSX.ElementType, props: PropsS = {}): Pragma | Pragma[] => {
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
    const node    = IntrinsicElement.make(type, props);
    node.children = connectDirectChildren(children);
    return node;

  case 'function':
    return FunctionElement.make(type, props);

  case 'boolean':
  case 'number':
  case 'bigint':
  case 'symbol':
    return TextElement.make(`${type}`);
  }

  throw new Error(`Unknown Tag: ${type}`);
};



const connectDirectChildren = (children: (Pragma | string)[]): Pragma[] => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = TextElement.make(c);
    }

    c.meta.idx = i;
    c.meta.id  = `${c._name}:${i}`;
    children[i] = c;
  }

  return children as Pragma[];
};
