import {Children, type Dialog, type Message} from '#disreact/dsx/intrinsic-elements/index.ts';
import {type DisReact, jsx} from '#disreact/dsx/jsx-runtime.ts';
import type {bool, ne, str} from '#src/internal/pure/types-pure.ts';



export const DSXTag = 'dsx';

export type SubmitAttributes = {
  root_id   : str;
  submission: bool;
  children  : Message.Attributes;
};

export type MessageComponentAttributes = {
  root_id  : str;
  component: bool;
  children : Dialog.Attributes | Message.Attributes;
};

export type Attributes =
  | SubmitAttributes
  | MessageComponentAttributes;


export type Model = DisReact.Intrinsic & {
  _tag  : typeof DSXTag;
  render: () => ne;
  props: Attributes & {
    children: Dialog.Model |  Message.Model;
  };
};


export const createRootElement = (
  _tag: str,
  props: ne,
): Model => {
  return {
    _tag  : DSXTag,
    render: () => jsx(_tag, props),
    props : {
      ...props,
      children: Children.asNodes(props.children).map((child) => child),
    },
  };
};
