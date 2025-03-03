/* eslint-disable no-case-declarations */
import * as Element from '#src/disreact/codec/dsx/index.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import {type Children, Props} from 'src/disreact/codec/dsx';


export const fragment = undefined;



export const dsx = (type: JSX.ElementType, props: Props.T<Element.T> = {}): Children.T<Element.T> => {
  if (Props.hasChild(props)) {
    if (Props.hasChildren(props)) {
      return dsxs(type, {...props, children: props.children.flat()});
    }

    return dsxs(type, {...props, children: [props.children]});
  }

  return dsxs(type, {...props, children: []});
};



export const dsxs = (type: JSX.ElementType, props: Props.Children<Element.T>): Children.T<Element.T> => {
  const children = props.children.flat();

  delete (props as Props.T<Element.T>).children;

  switch (typeof type) {
  case 'undefined':
    return children;

  case 'string':
    const element    = Element.Intrinsic.make(type, props);
    element.children = connectDirectChildren(children);
    return element;

  case 'function':
    return Element.Function.make(type, props);

  case 'boolean':
  case 'number':
  case 'bigint':
  case 'symbol':
    return Element.Text.make(type.toString());
  }

  throw new Error(`Unknown Tag: ${type}`);
};



const connectDirectChildren = (children: (Element.T | string)[]): Element.T[] => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = Element.Text.make(c);
    }

    c.meta.idx  = i;
    c.meta.id   = `${c._name}:${i}`;
    children[i] = c;
  }

  return children as Element.T[];
};
