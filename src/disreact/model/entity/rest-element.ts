import {EMPTY, ZERO} from '#src/disreact/codec/constants/common.ts';
import {RESERVED} from '#src/disreact/codec/constants/index.ts';
import {Element} from '#src/disreact/model/element/element.ts';



export interface RestElement extends Element.Meta {
  _tag    : Element.Tag.REST;
  type    : string;
  props   : any;
  children: any[];
}

export namespace RestElement {
  export type T = RestElement;

  export const make = (type: string, props: any): RestElement => {
    return {
      _tag    : Element.Tag.REST,
      type,
      idx     : ZERO,
      id      : EMPTY,
      step_id : EMPTY,
      full_id : EMPTY,
      props,
      children: [] as any[],
    };
  };

  export const is = (type: Element.Any): type is RestElement => type._tag === Element.Tag.REST;

  export const clone = (self: RestElement): RestElement => {
    const {props, children, ...rest} = self;

    const reserved = {} as any;

    for (const key of RESERVED) {
      const prop = props[key];
      if (prop) {
        reserved[key] = prop;
        delete props[key];
      }
    }

    const cloned    = structuredClone(rest) as RestElement;
    cloned.props    = structuredClone(props);
    cloned.children = children;

    for (const key of Object.keys(reserved)) {
      cloned.props[key] = reserved[key];
      props[key]        = reserved[key];
    }

    return cloned;
  };
}
