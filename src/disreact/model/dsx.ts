/* eslint-disable no-case-declarations */
import {Props} from '#src/disreact/model/component/props.ts';
import {Element} from '#src/disreact/model/element/element.ts';
import {RestElement} from '#src/disreact/model/element/rest-element.ts';
import {TaskElement} from '#src/disreact/model/element/task-element.ts';
import {TextElement} from '#src/disreact/model/element/text-element.ts';



export namespace dsx {
  export const fragment = Element.Fragment;

  export const single = (type: any, props?: any): Element | Element[] => {
    Props.ensure(props);
    props.children?.flat();
    return multi(type, props);
  };

  export const multi = (type: any, props: any): Element | Element[] => {
    const children = props.children.flat();
    delete props.children;

    switch (typeof type) {
      case 'undefined':
        return children;

      case 'string':
        const node    = Element.Rest.make(type, props);
        node.children = connectDirectChildren(children);
        return node;

      case 'function':
        return Element.Task.make(type, props);

      case 'boolean':
      case 'number':
      case 'bigint':
      case 'symbol':
        return Element.Text.make(type.toString());
    }

    throw new Error(`Unknown Tag: ${type}`);
  };

  const connectDirectChildren = (children: any): Element.Any[] => {
    for (let i = 0; i < children.length; i++) {
      let c = children[i];

      if (typeof c === 'string') {
        c = Element.Text.make(c);
      }

      c.idx       = i;
      children[i] = c;
    }

    return children as Element.Any[];
  };
}
