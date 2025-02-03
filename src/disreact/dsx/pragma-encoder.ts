/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return */
import {encode_denylist} from '#src/disreact/dsx/config.ts';
import {dtml} from '#src/disreact/dsx/index.ts';



export const dsxencode = (node: any): any => {
  const next = unwrapFunctions(node);

  return next.map((n: any) => encodeInner(n));
};



const unwrapFunctions = (node: any): any => {
  if (typeof node === 'string') {
    return {kind: 'text', value: node, name: 'string'};
  }
  if (node.kind === 'text') {
    return {...node, name: 'string'};
  }
  if (node.kind === 'intrinsic') {
    node.children = node.children.flatMap(unwrapFunctions);
    return node;
  }
  if (node.kind === 'function') {
    return node.children.flatMap(unwrapFunctions);
  }
  return node;
};



const encodeInner = (node: any): any => {
  const children = {} as any;

  for (const c of node.children ?? []) {
    children[c.name] ??= [];
    children[c.name].push(encodeInner(c));
  }

  node.props     = encodeProps(node.props);
  let acc        = {} as any;

  switch (node.name) {
    case dtml.command:
    case dtml.param:
    case dtml.choice: {
      acc = node.props;
      return acc;
    }

    case dtml.buttons: {
      acc.type       = 1;
      acc.components = children.button;
      return acc;
    }

    case dtml.button: {
      const {primary, secondary, success, danger, link, premium, ...props} = node.props;
      if (primary) acc.style = 1;
      if (secondary) acc.style = 2;
      if (success) acc.style = 3;
      if (danger) acc.style = 4;
      if (link) acc.style = 5;
      if (secondary) acc.style = 6;
      acc       = {...props, ...acc};
      acc.emoji = children.emoji?.[0];
      acc.type  = 2;
      return acc;
    }

    case dtml.menu: {
      return acc;
    }


    case dtml.option: {
      return acc;
    }

    case dtml.value: {
      const {user, role, channel, id} = node.props;
      if (user) acc.type = 'user';
      if (role) acc.type = 'role';
      if (channel) acc.type = 'channel';
      acc.id = id;
      return acc;
    }

    case dtml.emoji: {
      return node.props;
    }

    case dtml.text: {
      const {paragraph, ...props} = node.props;
      if (paragraph) acc.type = 2;
      else acc.type = 1;
      acc = {...props, ...acc};
      return acc;
    }

    case dtml.message: {
      children.embed ??= [];
      children.buttons ??= [];
      acc            = node.props;
      acc.flags      = node.props.ephemeral ? 64 : undefined;
      acc.embeds     = children.embed;
      acc.components = children.buttons;
      return acc;
    }

    case dtml.content: {
      return acc;
    }
    case dtml.modal: {
      return acc;
    }
    case dtml.embed: {
      acc.title       = children.title[0];
      acc.description = children.description[0];
      return acc;
    }
    case dtml.title:
      acc = children.string[0];
      return acc;

    case dtml.description:
      acc = children.string[0];
      return acc;

    case dtml.field:
    case dtml.footer: {
      return acc;
    }

    case dtml.string: {
      return node.value;
    }

    default:
      return {};
  }
};


const encodeProps = (props: any): any => {
  if (!props) return {};
  const acc = {} as any;
  for (const k of Object.keys(props as object)) {
    if (!(k in encode_denylist)) {
      acc[k] = props[k];
    }
  }
  return acc;
};
