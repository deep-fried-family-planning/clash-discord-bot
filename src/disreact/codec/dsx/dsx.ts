/* eslint-disable no-case-declarations */
import * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import * as Props from '#src/disreact/codec/element/props.ts';
import * as TextElement from '#src/disreact/codec/element/text-element.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';



export const fragment = undefined;



export const dsx = (type: JSX.ElementType, props: Props.Type<Element.T> = {}): Element.T | Element.T[] => {
  if (Props.hasChild(props)) {
    if (Props.hasChildren(props)) {
      return dsxs(type, {...props, children: props.children.flat()});
    }

    return dsxs(type, {...props, children: [props.children]});
  }

  return dsxs(type, {...props, children: []});
};



export const dsxs = (type: JSX.ElementType, props: Props.Children<Element.T>): Element.T | Element.T[] => {
  const children = props.children.flat();

  delete (props as Props.Type<Element.T>).children;

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



const connectDirectChildren = (children: (Element.T | string)[]): Element.T[] => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = TextElement.make(c);
    }

    c.meta.idx  = i;
    c.meta.id   = `${c._name}:${i}`;
    children[i] = c;
  }

  return children as Element.T[];
};
