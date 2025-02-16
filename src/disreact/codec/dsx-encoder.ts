import {$a, $at, $b, $blockquote, $br, $code, $details, $h1, $h2, $h3, $i, $li, $mask, $ol, $p, $pre, $s, $small, $u, $ul} from '#src/disreact/codec/abstract/dfmd.ts';
import {$default, $embed, $emoji, $field, $footer, $message, $modal, $option, $textarea} from '#src/disreact/codec/abstract/dtml.ts';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import type {Pragma} from '#src/disreact/dsx/lifecycle.ts';
import console from 'node:console';
import * as Attr from './abstract/attributes.ts';
import * as DFMD from './abstract/dfmd.ts';

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


export const dsxEncode = (node: Pragma) => {
  if (node.kind === 'text') {
    return node.value;
  }
  const queue = [] as any[][];
  const visited = [] as any[];

  if (node.kind === 'function') {
    for (const c of node.children) {
      queue.push([c, c.children]);
    }
  }
  else {
    queue.push([node, node.children]);
  }

  const accumulator = [] as any[][];

  // while (queue.length) {
  //
  // }


  do {
    const [parent, children] = queue.pop() as any;

    console.log('parent', parent.name);

    if (parent.kind === 'text') {
      throw new Error();
    }
    if (parent.kind === 'function') {
      throw new Error();
    }

    parent.acc ??= {};
    parent.acc.tag = parent.name;
    parent.acc.props = parent.props;
    parent.acc.children ??= [] as any[];

    for (let i = 0; i < children.length; i++) {
      const c = children[i];

      if (c.kind === 'text') {
        parent.acc.children.push(c.value);
      }
      if (c.kind === 'function') {
        queue.push([parent, children.slice(i + 1)]);
        queue.push([parent, c.children]);
        break;
      }
      if (c.kind === 'intrinsic') {
        c.acc ??= {};
        c.tag ??= c.name;

        queue.push([c, c.children]);
        parent.acc.children.push(c.acc);
      }
    }

    accumulator.push(parent.acc);
  }
  while (queue.length);

  console.log('ACCUMULATION');

  // do {
  //   const parent = accumulator.pop();
  //
  //   console.log(parent);
  //   // for (const c of children) {
  //   //   console.log(c.acc);
  //   // }
  //   // console.log('---');
  // } while (accumulator.length);


  return accumulator[0];
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
    case $option: {
      return node.props;
    }

    case $default: {
      const {user, role, channel, id} = node.props;
      if (user) acc.type = 'user';
      if (role) acc.type = 'role';
      if (channel) acc.type = 'channel';
      acc.id = id;
      return acc;
    }

    case $emoji: {
      return node.props;
    }

    case $textarea: {
      const {paragraph, ...props} = node.props;
      if (paragraph) acc.style = 2;
      else acc.style = 1;
      acc.type = 4;
      acc = {...props, ...acc};
      acc.custom_id = node.props.custom_id ?? node.id_step;
      return acc;
    }

    case $message: {
      children.embed ??= [];
      children.buttons ??= [];
      acc = node.props;
      acc.flags = node.props.ephemeral ? 64 : undefined;
      acc.embeds = children.embed;
      acc.components = children.buttons;
      return acc;
    }

    case $modal: {
      acc.title = node.props.title;
      acc.custom_id = node.props.custom_id ?? NONE_STR;
      acc.components = children.text.map((c: any) => ({type: 1, components: [c]}));
      return acc;
    }

    case $embed: {
      acc.title = children.title[0];
      acc.description = children.description?.join('');
      return acc;
    }

    case $field:
    case $footer: {
      acc.fields = children.field;
      return acc;
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
    case  $at: {
      const {everyone, here, user, role, channel, id} = node.props;
      switch (true) {
        case everyone:
          return '@everyone';
        case here:
          return '@here';
        case user:
          return `@${id}`;
        case role:
          return `@&${id}`;
        case channel:
          return `#${id}`;
        default:
          return '';
      }
    }
    case $a: {
      const {href, embed} = node.props;
      if (node.children.length) {
        return;
      }

      return '';
    }
    case $mask: {
      return node.children.join(' ');
    }
    case $p: {
      return node.children.join(' ');
    }
    case $br: {
      return '\n';
    }
    case $b: {
      return `**${node.children.join('')}**`;
    }
    case $i: {
      return `*${node.children.join('')}*`;
    }
    case $u: {
      return `__${node.children.join('')}__`;
    }
    case $s: {
      return `~~${node.children.join('')}~~`;
    }
    case $details: {
      return `||${node.children.join('')}||`;
    }
    case $code: {
      return `\`${node.children.join('')}\``;
    }
    case $pre: {
      const {syntax} = node.props;
      if (syntax) {
        return `\n\`\`\`${syntax}\n${node.children.join('')}\n\`\`\``;
      }
      return `\n\`\`\`\n${node.children.join(' ')}\n\`\`\``;
    }
    case $blockquote: {
      return `\n> ${node.children.join(' ')}`;
    }
    case $h1: {
      return `\n# ${node.children.join(' ')}`;
    }
    case $h2: {
      return `\n## ${node.children.join(' ')}`;
    }
    case $h3: {
      return `\n### ${node.children.join(' ')}`;
    }
    case $small: {
      return `\n-# ${node.children.join(' ')}`;
    }
    case $ol: {
      return (node.children as string[]).reduce((acc, c, i) => `${acc}\n${i + 1}. ${c}`, ' ');
    }
    case $ul: {
      return node.children.join('\n* ');
    }
    case $li: {
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
    if (!(k in Attr)) {
      acc[k] = props[k];
    }
  }

  return acc;
};


// const encodeAttributes = (node: any): any => {
//   node.children = node.children ?? [];
//
//   const encoded = Intrinsic.encodeAttributes(node.name as Intrinsic.ElementTag, node.props);
// };
