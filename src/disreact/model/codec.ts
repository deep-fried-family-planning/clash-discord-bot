/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions */
import {__DISREACT_NONE} from '#src/disreact/api/constants.ts';
import {Rest} from '#src/disreact/api/index.ts';
import {ActionRowTag, ButtonTag, DialogTag, EmbedTag, MessageTag, SelectMenuTag, SelectOptionTag, TextInputTag, TextTag} from '#src/disreact/model/dsx/intrinsic.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {Kv} from '#src/internal/pure/effect.ts';



export const encodeTreeAsMessage = (
  node: DisReactNode,
): Rest.Message => {
  return encodeTree(node);
};


export const encodeTreeAsDialog = (
  node: DisReactNode,
): Rest.Dialog => {
  return encodeTree(node);
};



export const encodeTree = (node: DisReactNode): any => {
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



export const encodeElementNode = (node: DisReactNode) => {
  const props = filterValidProps(node.props);
  const nodes = node.nodes;

  switch (node.type) {
    case ActionRowTag: {
      return {
        type      : Rest.ComponentType.ACTION_ROW,
        components: nodes.filter((c) => c.type === ButtonTag || c.type === SelectMenuTag || c.type === TextTag || typeof c.type === 'function').flatMap((c) => encodeTree(c)),
      };
    }

    case ButtonTag: {
      return {
        ...props,
        type     : Rest.ComponentType.BUTTON,
        custom_id: props.custom_id ?? node.id,
        style    : props.style ?? Rest.ButtonStyle.PRIMARY,
      };
    }

    case DialogTag: {
      return {
        ...props,
        custom_id : props.custom_id ?? node.id,
        title     : props.title ?? __DISREACT_NONE,
        components: nodes.filter((c) => c.type === TextTag || typeof c.type === 'function').flatMap((c) => ({
          type      : Rest.ComponentType.ACTION_ROW,
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
        type     : Rest.ComponentType.TEXT_INPUT,
        style    : props.style ?? Rest.TextInputStyle.SHORT,
      };
    }

    default:
      throw new Error(`<${node.type}/> not implemented`);
  }
};


export const encodeSelectMenuElement = (nodes: DisReactNode[], props: any) => {
  const {
          string,
          options,
          user,
          role,
          channel,
          mention,
          default_values,
          channel_types,
          ...restProps
        } = props;

  switch (true) {
    case string:
      return {
        ...restProps,
        type   : Rest.ComponentType.STRING_SELECT,
        options: options ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case user:
      return {
        ...restProps,
        type          : Rest.ComponentType.USER_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case role:
      return {
        ...restProps,
        type          : Rest.ComponentType.ROLE_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
      };
    case channel:
      return {
        ...restProps,
        type          : Rest.ComponentType.CHANNEL_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === SelectOptionTag).flatMap((c) => encodeTree(c)),
        channel_types : channel_types ?? [],
      };
    case mention:
      return {
        ...restProps,
        type          : Rest.ComponentType.MENTIONABLE_SELECT,
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
