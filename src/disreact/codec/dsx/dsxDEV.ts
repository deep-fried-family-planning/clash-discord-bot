/* eslint-disable no-case-declarations */
import * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import * as TextElement from '#src/disreact/codec/element/text-element.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';



type PropsS = {children?: Element.T | null} | null;
type PropsM = {children: Element.T[]};



export const fragment = undefined;



export const dsxDEV = (type: JSX.ElementType, props: PropsS = {}): Element.T | Element.T[] => {
  if (!props) {
    return dsxsDEV(type, {children: []});
  }

  if (!props.children) {
    return dsxsDEV(type, {...props, children: []});
  }

  if (props.children instanceof Array) {
    return dsxsDEV(type, {...props, children: props.children.flat()});
  }

  return dsxsDEV(type, {...props, children: [props.children]});
};



export const dsxsDEV = (type: JSX.ElementType, props: PropsM): Element.T | Element.T[] => {
  const children = props.children.flat();

  delete (props as Partial<Element.T>).children;

  switch (typeof type) {
  case 'undefined':
    return children;

  case 'string':
    const node    = IntrinsicElement.makeDEV(type, props);
    node.children = connectDirectChildren(children);
    return node;

  case 'function':
    return FunctionElement.makeDEV(type, props);

  case 'boolean':
  case 'number':
  case 'bigint':
  case 'symbol':
    return TextElement.makeDEV(type.toString());
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
