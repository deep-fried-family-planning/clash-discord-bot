import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import {encode_denylist} from '#src/disreact/dsx/config.ts';
import {DFMD, DTML} from '#src/disreact/dsx/index.ts';
import type {Pragma} from '#src/disreact/dsx/lifecycle.ts';
import console from 'node:console';


export type EncodedMessage = {
  content   : string;
  embeds    : any[];
  components: any[];
  flags?    : number | undefined;
  public?   : boolean | undefined;
};
export type EncodedDialog = {
  custom_id : string;
  title     : string;
  components: any[];
};
export type EncodedRoot =
  | EncodedMessage
  | EncodedDialog;



export const encodeMessageDsx = (node: Pragma): EncodedMessage => {
  const [encoded] = encodeDsx(node) as EncodedMessage[];

  const {public: p, ...rest} = encoded;

  if (p) {
    rest.flags = undefined;
  }

  return rest;
};



export const encodeDialogDsx = (node: Pragma): EncodedDialog => {
  const [encoded] = encodeDsx(node);

  return encoded as EncodedDialog;
};



export const encodeDsx = (node: Pragma): EncodedRoot[] => {
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

  const allChildren = [] as any[];

  for (const c of node.children ?? []) {
    const child = encodeInner(c);
    allChildren.push(child);
    children[c.name] ??= [];
    children[c.name].push(child);
  }

  node.props = encodeProps(node.props);
  let acc = {} as any;


  switch (node.name) {
    case DTML.command:
    case DTML.param:
    case DTML.choice: {
      acc = node.props;
      return acc;
    }

    case DTML.buttons: {
      acc.type = 1;
      acc.components = children.button;
      return acc;
    }

    case DTML.button: {
      const {primary, secondary, success, danger, link, premium, ...props} = node.props;
      if (primary) acc.style = 1;
      if (secondary) acc.style = 2;
      if (success) acc.style = 3;
      if (danger) acc.style = 4;
      if (link) acc.style = 5;
      if (premium) acc.style = 6;
      acc = {...props, ...acc};
      acc.emoji = children.emoji?.[0];
      acc.type = 2;
      acc.custom_id = node.props.custom_id ?? node.id_step;
      return acc;
    }

    case DTML.menu: {
      acc.options = children.option;
      return acc;
    }

    case DTML.option: {
      return node.props;
    }

    case DTML.value: {
      const {user, role, channel, id} = node.props;
      if (user) acc.type = 'user';
      if (role) acc.type = 'role';
      if (channel) acc.type = 'channel';
      acc.id = id;
      return acc;
    }

    case DTML.emoji: {
      return node.props;
    }

    case DTML.text: {
      const {paragraph, ...props} = node.props;
      if (paragraph) acc.style = 2;
      else acc.style = 1;
      acc.type = 4;
      acc = {...props, ...acc};
      acc.custom_id = node.props.custom_id ?? node.id_step;
      return acc;
    }

    case DTML.message: {
      children.embed ??= [];
      children.buttons ??= [];
      acc = node.props;
      acc.flags = node.props.ephemeral ? 64 : undefined;
      acc.embeds = children.embed;
      acc.components = children.buttons;
      return acc;
    }

    case DTML.content: {
      return acc;
    }

    case DTML.modal: {
      acc.title = node.props.title;
      acc.custom_id = node.props.custom_id ?? NONE_STR;
      acc.components = children.text.map((c: any) => ({type: 1, components: [c]}));
      return acc;
    }

    case DTML.embed: {
      acc.title = children.title[0];
      acc.description = children.description?.join('');
      return acc;
    }

    case DTML.title:{
      acc = children.string[0];
      return acc;
    }

    case DTML.description:{
      // acc = children.string[0];
      return allChildren.join('');
    }

    case DTML.field:
    case DTML.footer: {
      acc.fields = children.field;
      return acc;
    }

    case DTML.string: {
      return node.value;
    }
  }

  if (node.name in DFMD) {
    node.children = allChildren;
    acc = encodeDFMD(node);
    return acc;
  }

  throw new Error();
};


const encodeDFMD = (node: any): any => {
  console.log(node);

  node.children = node.children ?? [];

  switch (node.name) {
    case DTML.string: {
      return node.value;
    }

    case DFMD.at: {
      const {everyone, here, user, role, channel, id} = node.props;
      switch (true) {
        case everyone: return '@everyone';
        case here: return '@here';
        case user: return `@${id}`;
        case role: return `@&${id}`;
        case channel: return `#${id}`;
        default: return '';
      }
    }
    case DFMD.a: {
      const {href, embed} = node.props;
      if (node.children.length) {
        return;
      }

      return '';
    }
    case DFMD.mask: {
      return node.children.join(' ');
    }
    case DFMD.p: {
      return node.children.join(' ');
    }
    case DFMD.br: {
      return '\n';
    }
    case DFMD.b: {
      return `**${node.children.join('')}**`;
    }
    case DFMD.i: {
      return `*${node.children.join('')}*`;
    }
    case DFMD.u: {
      return `__${node.children.join('')}__`;
    }
    case DFMD.s: {
      return `~~${node.children.join('')}~~`;
    }
    case DFMD.details: {
      return `||${node.children.join('')}||`;
    }
    case DFMD.code: {
      return `\`${node.children.join('')}\``;
    }
    case DFMD.pre: {
      const {syntax} = node.props;
      if (syntax) {
        return `\n\`\`\`${syntax}\n${node.children.join('')}\n\`\`\``;
      }
      return `\n\`\`\`\n${node.children.join(' ')}\n\`\`\``;
    }
    case DFMD.blockquote: {
      return `\n> ${node.children.join(' ')}`;
    }
    case DFMD.h1: {
      return `\n# ${node.children.join(' ')}`;
    }
    case DFMD.h2: {
      return `\n## ${node.children.join(' ')}`;
    }
    case DFMD.h3: {
      return `\n### ${node.children.join(' ')}`;
    }
    case DFMD.small: {
      return `\n-# ${node.children.join(' ')}`;
    }
    case DFMD.ol: {
      return (node.children as string[]).reduce((acc, c, i) => `${acc}\n${i + 1}. ${c}`, ' ');
    }
    case DFMD.ul: {
      return node.children.join('\n* ');
    }
    case DFMD.li: {
      return node.children.join('');
    }
    default: {
      throw new Error();
    }
  }
};


const encodeProps = (props: any): any => {
  if (!props) {
    return {};
  }

  const acc = {} as any;

  for (const k of Object.keys(props as object)) {
    if (!(k in encode_denylist)) {
      acc[k] = props[k];
    }
  }

  return acc;
};
