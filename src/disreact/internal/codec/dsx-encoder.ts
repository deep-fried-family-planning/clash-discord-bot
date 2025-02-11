/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return */
import {encode_denylist} from '#src/disreact/internal/dsx/config.ts';
import {DTML} from '#src/disreact/internal/dsx/index.ts';
import type {Pragma} from '#src/disreact/internal/index.ts';


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

  for (const c of node.children ?? []) {
    children[c.name] ??= [];
    children[c.name].push(encodeInner(c));
  }

  node.props     = encodeProps(node.props);
  let acc        = {} as any;

  switch (node.name) {
    case DTML.command:
    case DTML.param:
    case DTML.choice: {
      acc = node.props;
      return acc;
    }

    case DTML.buttons: {
      acc.type       = 1;
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
      acc       = {...props, ...acc};
      acc.emoji = children.emoji?.[0];
      acc.type  = 2;
      acc.custom_id = node.props.custom_id ?? node.id_step;
      return acc;
    }

    case DTML.menu: {
      return acc;
    }


    case DTML.option: {
      return acc;
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
      if (paragraph) acc.type = 2;
      else acc.type = 1;
      acc = {...props, ...acc};
      acc.custom_id = node.props.custom_id ?? node.id_step;
      return acc;
    }

    case DTML.message: {
      children.embed ??= [];
      children.buttons ??= [];
      acc            = node.props;
      acc.flags      = node.props.ephemeral ? 64 : undefined;
      acc.embeds     = children.embed;
      acc.components = children.buttons;
      return acc;
    }

    case DTML.content: {
      return acc;
    }
    case DTML.modal: {
      acc.title = node.props.title;
      acc.custom_id = node.props.custom_id ?? node.id_step;
      acc.components = children.text.map((c: any) => ({type: 1, components: [c]}));
      return acc;
    }
    case DTML.embed: {
      acc.title       = children.title[0];
      acc.description = children.description[0];
      return acc;
    }
    case DTML.title:
      acc = children.string[0];
      return acc;

    case DTML.description:
      acc = children.string[0];
      return acc;

    case DTML.field:
    case DTML.footer: {
      return acc;
    }

    case DTML.string: {
      return node.value;
    }

    default:
      return {};
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
