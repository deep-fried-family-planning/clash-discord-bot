/* eslint-disable no-case-declarations */
import * as FunctionElement from '#src/disreact/codec/element/task-element.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as IntrinsicElement from '#src/disreact/codec/element/rest-element.ts';
import * as TextElement from '#src/disreact/codec/element/text-element.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';



type PropsS = {children?: Element.Element | null} | null;
type PropsM = {children: Element.Element[]};



export const fragment = undefined;



export const dsxDEV = (type: JSX.ElementType, props: PropsS = {}): Element.Element | Element.Element[] => {
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



export const dsxsDEV = (type: JSX.ElementType, props: PropsM): Element.Element | Element.Element[] => {
  const children = props.children.flat();

  delete (props as Partial<Element.Element>).children;

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



const connectDirectChildren = (children: (Element.Element | string)[]): Element.Element[] => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = TextElement.make(c);
    }

    c.meta.idx  = i;
    c.meta.id   = `${c._name}:${i}`;
    children[i] = c;
  }

  return children as Element.Element[];
};
