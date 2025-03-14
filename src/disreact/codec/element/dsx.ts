/* eslint-disable no-case-declarations */
import * as TreeTask from '#src/disreact/model/entity/element-task.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as RestElement from '#src/disreact/model/entity/element-rest.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as TextElement from '#src/disreact/model/entity/leaf.ts';
import type {JSX} from '#src/disreact/jsx-runtime.ts';
import * as Children from '#src/disreact/model/entity/children.ts';



export const fragment = undefined;



export const dsx = (type: JSX.ElementType, props: Props.Any<Element.Elem> = {}): Element.Elem | Element.Elem[] => {
  if (Props.hasMany(props)) {
    if (Children.isMany(props.children)) {
      return dsxs(type, {...props, children: props.children.flat()});
    }

    return dsxs(type, {...props, children: [props.children]});
  }

  return dsxs(type, {...props, children: []});
};



export const dsxs = (type: JSX.ElementType, props: Props.AndMany<Element.Elem>): Element.Elem | Element.Elem[] => {
  const children = props.children.flat();

  delete (props as Props.Any<Element.Elem>).children;

  switch (typeof type) {
  case 'undefined':
    return children;

  case 'string':
    const node    = RestElement.make(type, props);
    node.children = connectDirectChildren(children);
    return node;

  case 'function':
    return TreeTask.make(type, props);

  case 'boolean':
  case 'number':
  case 'bigint':
  case 'symbol':
    return TextElement.make(`${type}`);
  }

  throw new Error(`Unknown Tag: ${type}`);
};



const connectDirectChildren = (children: (Element.Elem | string)[]): Element.Elem[] => {
  for (let i = 0; i < children.length; i++) {
    let c = children[i];

    if (typeof c === 'string') {
      c = TextElement.make(c);
    }

    c.meta.idx  = i;
    c.meta.id   = `${c._name}:${i}`;
    children[i] = c;
  }

  return children as Element.Elem[];
};
