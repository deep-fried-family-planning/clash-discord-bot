/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-assignment */
import {ActionRowTag, ButtonTag, DialogTag, EmbedTag, MessageTag, SelectMenuTag, SelectOptionTag, TextInputTag, TextTag} from '#disreact/dsx/intrinsic.ts';
import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';
import {Kv} from '#pure/effect';
import {Discord} from 'dfx/index';



export const NONE      = '-';
export const BUTTON_STYLE     = Discord.ButtonStyle;
export const COMPONENT_TYPE   = Discord.ComponentType;
export const TEXT_INPUT_STYLE = Discord.TextInputStyle;
export type BUTTON_STYLE     = Discord.ButtonStyle;
export type COMPONENT_TYPE   = Discord.ComponentType;
export type TEXT_INPUT_STYLE = Discord.TextInputStyle;

export const encodeTreeAsMessage = (
  node: DisReactAbstractNode,
) => {
  return encodeTree(node);
};



export const encodeTree = (node: DisReactAbstractNode): any => {
  switch (typeof node.type) {
    case 'string':
      return encodeElementNode(node);
    case 'function': {
      switch (node.nodes.length) {
        case 0:
          return null;
        case 1:
          return encodeTree(node.nodes[0]);
        default:
          return node.nodes.flatMap((child) => encodeTree(child));
      }
    }
  }
};



export const encodeElementNode = (node: DisReactAbstractNode) => {
  const props = filterValidProps(node.props);
  const nodes = node.nodes;

  switch (node.type) {
    case ActionRowTag: {
      return {
        type      : COMPONENT_TYPE.ACTION_ROW,
        components: nodes.filter((c) => c.type === ButtonTag || c.type === SelectMenuTag || c.type === TextTag || typeof c.type === 'function').flatMap((c) => encodeTree(c)),
      };
    }

    case ButtonTag: {
      return {
        ...props,
        type     : COMPONENT_TYPE.BUTTON,
        custom_id: props.custom_id ?? node.id,
        style    : props.style ?? BUTTON_STYLE.PRIMARY,
      };
    }

    case DialogTag: {
      return {
        ...props,
        custom_id : props.custom_id ?? node.id,
        title     : props.title ?? NONE,
        components: nodes.filter((c) => c.type === TextTag || typeof c.type === 'function').flatMap((c) => ({
          type      : COMPONENT_TYPE.ACTION_ROW,
          components: [encodeTree(c)],
        })),
      };
    }

    case EmbedTag: {
      return {
        ...props,
        // todo yikes lol
      };
    }

    case MessageTag: {
      return {
        ...props,
        embeds    : nodes.filter((c) => c.type === EmbedTag || typeof c.type === 'function').flatMap((c) => encodeTree(c)),
        components: nodes.filter((c) => c.type === ActionRowTag || typeof c.type === 'function').flatMap((c) => encodeTree(c)),
      };
    }

    case SelectMenuTag: {
      return encodeSelectMenuElement(nodes, props);
    }

    case SelectOptionTag: {
      return {
        ...props,
      };
    }

    case TextInputTag:
    case TextTag: {
      return {
        ...props,
        custom_id: props.custom_id ?? node.id,
        type     : COMPONENT_TYPE.TEXT_INPUT,
        style    : props.style ?? TEXT_INPUT_STYLE.SHORT,
      };
    }

    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`<${node.type}/> not implemented`);
  }
};


export const encodeSelectMenuElement = (nodes: DisReactAbstractNode[], props: any) => {
  const {string, options, user, role, channel, mention, default_values, channel_types, ...restProps} = props;

  switch (true) {
    case string:
      return {
        ...restProps,
        type   : COMPONENT_TYPE.STRING_SELECT,
        options: options ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case user:
      return {
        ...restProps,
        type          : COMPONENT_TYPE.USER_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case role:
      return {
        ...restProps,
        type          : COMPONENT_TYPE.ROLE_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case channel:
      return {
        ...restProps,
        type          : COMPONENT_TYPE.CHANNEL_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
        channel_types : channel_types ?? [],
      };
    case mention:
      return {
        ...restProps,
        type          : COMPONENT_TYPE.MENTIONABLE_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    default:
      throw new Error('invalid select menu type');
  }
};


export const filterValidProperty = (a: any, k: any): boolean => {
  if (typeof k !== 'string') return false;
  if (k.startsWith('_')) return false;

  switch (typeof a) {
    case 'function':
    case 'undefined':
    case 'symbol':
      return false;

    case 'string':
      switch (k) {
        case 'children':
        case 'onClick':
        case 'onSubmit':
        case 'onSelect':
          return false;
        default:
          return true;
      }

    default:
      return true;
  }
};

export const filterValidProps = Kv.filter(filterValidProperty);
