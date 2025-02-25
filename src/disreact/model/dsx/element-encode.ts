import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import {All, DFMD, DTML, Reserved} from '#src/disreact/codec/constants/index.ts';
import console from 'node:console';
import {inspect } from 'node:util';



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

  console.log('encoded', inspect(rest, false, null));

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



const encodeInner = (node: any): any => {
  const children = {} as any;


  const allChildren = [] as any[];

  for (const c of node.children ?? []) {
    const child = encodeInner(c);
    allChildren.push(child);

    const normalized = normalizedNodeName(c._name);

    children[normalized] ??= [];
    children[normalized].push(child);
  }

  node.props = encodeProps(node.props);

  const {
          primary, secondary, success, danger, link, premium,
          user, role, channel,
          paragraph, short,
          ...props
        } = node.props;

  let acc = {...props};

  switch (node._name) {
  case DTML.emoji:
    return acc;

  case DTML.button: {
    if (primary) acc.style = 1;
    if (secondary) acc.style = 2;
    if (success) acc.style = 3;
    if (danger) acc.style = 4;
    if (link) acc.style = 5;
    if (premium) acc.style = 6;
    acc       = {...props, ...acc};
    acc.emoji = children.emoji?.[0];
    acc.type  = 2;
    acc.custom_id ??= node.meta.step_id;
    return acc;
  }

  case DTML.primary:
    acc.style ??= 1;
  case DTML.secondary:
    acc.style ??= 2;
  case DTML.success:
    acc.style ??= 3;
  case DTML.danger:
    acc.style ??= 4;
  case DTML.link:
    acc.style ??= 5;
  case DTML.premium:
    acc.style ??= 6;
    acc.type = 2;
    acc.custom_id ??= node.meta.step_id;
    return acc;

  case DTML.option:
    return acc;

  case DTML.select:
    acc.custom_id ??= node.meta.step_id;
    acc.type = 3;
    acc.options ??= children[DTML.options];
    return {
      type      : 1,
      components: [acc],
    };

  case DTML.$default: {
    if (user) acc.type = 'user';
    if (role) acc.type = 'role';
    if (channel) acc.type = 'channel';
    acc.id = user ?? role ?? channel;
    return acc;
  }

  case DTML.users:
    acc.type ??= 5;
  case DTML.roles:
    acc.type ??= 6;
  case DTML.channels:
    acc.type ??= 8;
  case DTML.mentions:
    acc.type ??= 7;
    acc.custom_id ??= node.meta.step_id;
    acc.default_values = children[All.default_values];
    return {
      type      : 1,
      components: [acc],
    };

  case DTML.actions:
  case DTML.buttons: {
    acc.type       = 1;
    acc.components = children[All.components];
    return acc;
  }

  case DTML.message: {
    acc.flags      = acc.ephemeral ? 64 : undefined;
    acc.embeds     = children[All.embeds];
    acc.components = children[All.components];
    return acc;
  }

  case DTML.textinput:
  case DTML.textarea:
  case DTML.text: {
    if (paragraph) acc.style ??= 2;
    else acc.style ??= 1;
    acc.type = 4;
    acc.custom_id ??= node.meta.step_id;
    return {
      type      : 1,
      components: [acc],
    };
  }

  case DTML.dialog:
  case DTML.modal:
    acc.custom_id ??= NONE_STR;
    acc.components = children[All.components];
    return acc;

  case DTML.embed: {
    acc.footer      = children.footer?.[0];
    acc.fields      = children[All.fields];
    acc.description = children[All.string]?.join('');
    return acc;
  }

  case DTML.field:
    return acc;

  case DTML.footer: {
    acc.text = children[All.string]?.join('');
    return acc;
  }

  case DTML.string:
    return node.value;
  }

  if (node._name in DFMD) {
    node.children = allChildren;
    acc           = encodeDFMD(node);
    return acc;
  }

  throw new Error();
};


const encodeDFMD = (node: any): any => {
  node.children = node.children ?? [];

  const {
          everyone, here, user, role, channel, id,
          href, embed,
          syntax,
        } = node.props;

  switch (node._name) {
  case DTML.string: {
    return node.value;
  }

  case DFMD.at: {
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
  case DFMD.a: {
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
    if (syntax) {
      return `\n\`\`\`${syntax}\n${node.children.join('')}\n\`\`\``;
    }
    return `\n\`\`\`\n${node.children.join('\n')}\n\`\`\``;
  }
  case DFMD.blockquote: {
    return `\n> ${node.children.join('\n')}`;
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
  case DFMD.li:
    return node.children.join('');
  }
  throw new Error(`Unrecognized markdown tag: ${node._name}`);
};



const normalizedNodeName = (name: string) => {
  switch (name) {
  case DTML.select:
  case DTML.users:
  case DTML.roles:
  case DTML.channels:
  case DTML.mentions:
  case DTML.text:
  case DTML.textvalue:
  case DTML.textarea:
  case DTML.actions:
  case DTML.buttons:
  case DTML.button:
  case DTML.primary:
  case DTML.secondary:
  case DTML.success:
  case DTML.danger:
  case DTML.link:
  case DTML.premium:
    return All.components;

  case DTML.embed:
    return All.embeds;

  case DTML.field:
    return All.fields;

  case DTML.group:
  case DTML.subcommand:
  case DTML.param:
  case DTML.option:
    return All.options;

  case DTML.$default:
    return All.default_values;

  case DTML.choice:
    return All.choices;

  case DFMD.at:
  case DFMD.a:
  case DFMD.mask:
  case DFMD.p:
  case DFMD.br:
  case DFMD.b:
  case DFMD.i:
  case DFMD.u:
  case DFMD.s:
  case DFMD.details:
  case DFMD.code:
  case DFMD.pre:
  case DFMD.blockquote:
  case DFMD.h1:
  case DFMD.h2:
  case DFMD.h3:
  case DFMD.small:
  case DFMD.ol:
  case DFMD.ul:
  case DFMD.li:
    return All.string;
  }

  return name;
};



const encodeProps = (props: any): any => {
  if (!props) {
    return {};
  }

  const acc = {} as any;

  for (const k of Object.keys(props as object)) {
    if (!(k in Reserved)) {
      acc[k] = props[k];
    }
  }

  return acc;
};



const unwrapFunctions = (node: any): any => {
  if (typeof node === 'string') {
    return {kind: 'text', value: node, _name: 'string'};
  }
  if (node._tag === All.TextElementTag) {
    return {...node, name: 'string'};
  }
  if (node._tag === All.IntrinsicElementTag) {
    node.children = node.children.flatMap(unwrapFunctions);
    return node;
  }
  if (node._tag === All.FunctionElementTag) {
    return node.children.flatMap(unwrapFunctions);
  }
  return node;
};
