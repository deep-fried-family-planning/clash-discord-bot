/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access */
import {NONE} from '#src/disreact/api/constants.ts';
import {Rest} from '#src/disreact/api/index.ts';
import {ButtonStyle} from '#src/disreact/api/rest.ts';
import { Tags} from '#src/disreact/model/dsx/index.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {Kv, pipe} from '#src/internal/pure/effect.ts';



export const encodeEntireTree = (
  root: DisReactNode,
): Rest.Message | Rest.Dialog => {
  return encodeTree(root);
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
    case Tags.description:
    case Tags.title: {
      // console.log(node.props);
      return node.props.value ?? node.props.content ?? node.nodes[0].type;
    }

    case Tags.text:
    case Tags.textinput: {
      return {
        ...props,
        custom_id: props.custom_id ?? node.id,
        type     : Rest.ComponentType.TEXT_INPUT,
        style    : props.style ?? Rest.TextInputStyle.SHORT,
      };
    }

    case Tags.success:
    case Tags.danger:
    case Tags.primary:
    case Tags.secondary:
    case Tags.link:
    case Tags.button: {
      filterBy(Tags.button, [], nodes);

      return {
        ...props,
        type     : Rest.ComponentType.BUTTON,
        custom_id: props.custom_id ?? node.relative_id,
        style    : {
          [Tags.success]  : ButtonStyle.SUCCESS,
          [Tags.danger]   : ButtonStyle.DANGER,
          [Tags.primary]  : ButtonStyle.PRIMARY,
          [Tags.secondary]: ButtonStyle.SECONDARY,
          [Tags.link]     : ButtonStyle.LINK,
          [Tags.button]   : (() => props.style ?? ButtonStyle.PRIMARY)(),
        }[node.type],
      };
    }

    case Tags.buttons: {
      const children = filterBy(Tags.buttons, [Tags.button], nodes);

      return {
        type      : Rest.ComponentType.ACTION_ROW,
        components: children.flatMap((child) => encodeTree(child)),
      };
    }

    case Tags.actionrow:
    case Tags.actions:
    case Tags.components: {
      const children = filterBy(
        Tags.actionrow,
        [
          Tags.button,
          Tags.select,
          Tags.selectmenu,
          Tags.text,
          Tags.textinput,
        ],
        nodes,
      );

      return {
        type      : Rest.ComponentType.ACTION_ROW,
        components: children.flatMap((child) => encodeTree(child)),
      };
    }

    case Tags.message: {
      const children = filterBy(
        Tags.message,
        [
          Tags.content,
          Tags.embeds,
          Tags.embed,
          Tags.actionrow,
          Tags.actions,
          Tags.components,
          Tags.buttons,
        ],
        nodes,
      );
      const content = children.find((c) => c.type === Tags.content)?.props.value;

      const embeds = children.find((c) => c.type === Tags.embeds);

      return {
        ...props,
        content   : props.content ?? content,
        embeds    : props.embeds ?? embeds?.nodes.flatMap((c) => encodeTree(c)),
        components: children.filter((c) => c.type === Tags.components).flatMap((c) => encodeTree(c)),
      };
    }

    case Tags.embeds: {
      const children = filterBy(
        Tags.embeds,
        [Tags.embed],
        nodes,
      );

      return children.flatMap((child) => encodeTree(child));
    }

    case Tags.embed: {
      const children = filterBy(
        Tags.embed,
        [
          Tags.title,
          Tags.description,
        ],
        nodes,
      );

      return {
        ...props,
        ...pipe(
          children,
          Kv.fromIterableWith((child) => [child.name, encodeTree(child)]),
        ),
      };
    }

    case Tags.modal:
    case Tags.dialog: {
      const children = filterBy(
        Tags.dialog,
        [
          Tags.text,
          Tags.textinput,
        ],
        nodes,
      );

      return {
        ...props,
        custom_id : props.custom_id ?? node.id,
        title     : props.title ?? NONE,
        components: children.map((c) => ({
          type      : Rest.ComponentType.ACTION_ROW,
          components: [c],
        })),
      };
    }

    case Tags.selectmenu:
    case Tags.select: {
      const children = filterBy(
        Tags.select,
        [Tags.option],
        nodes,
        );

      return {
        ...encodeSelectMenuElement(children, props),
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
        options: options ?? nodes.filter((c) => c.type === Tags.option).flatMap((c) => encodeTree(c)),
      };
    case user:
      return {
        ...restProps,
        type          : Rest.ComponentType.USER_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === Tags.option).flatMap((c) => encodeTree(c)),
      };
    case role:
      return {
        ...restProps,
        type          : Rest.ComponentType.ROLE_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === Tags.option).flatMap((c) => encodeTree(c)),
      };
    case channel:
      return {
        ...restProps,
        type          : Rest.ComponentType.CHANNEL_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === Tags.option).flatMap((c) => encodeTree(c)),
        channel_types : channel_types ?? [],
      };
    case mention:
      return {
        ...restProps,
        type          : Rest.ComponentType.MENTIONABLE_SELECT,
        default_values: default_values ?? nodes.filter((c) => c.type === Tags.option).flatMap((c) => encodeTree(c)),
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


export const filterBy = (parentTag: string, tags: string[], nodes: DisReactNode[]) => {
  const next = [] as DisReactNode[];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (typeof node.type === 'string') {
      if (tags.includes(node.type)) {
        next.push(node);
      }
      else {
        console.warn(`<${node.type}/> cannot be a child of <${parentTag}/>`);
      }
    }

    if (typeof node.type === 'function') {
      filterBy(parentTag, tags, node.nodes);
    }

    // if (typeof node.type === 'function') {
    //   next.push(...filterBy(parentTag, tags, node.nodes));
    // }
  }

  return next;
};
