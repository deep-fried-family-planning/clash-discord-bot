/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment */
import {onautocomplete, onclick, ondeselect, oninvoke, onselect, onsubmit} from '#src/disreact/dsx/dattributes.ts';
import {dsxid} from '#src/disreact/dsx/pragma.tsx';
import type {Pragma, PragmaElement, PragmaFunction, PragmaText} from '#src/disreact/dsx/types.ts';
import type {DEvent} from '#src/disreact/enum/devent.ts';
import {__dismount, __get, __mount, __prep} from '#src/disreact/internal/globals.ts';
import type {Hooks} from '#src/disreact/internal/hooks.ts';
import {Data, Equal} from 'effect';
import console from 'node:console';



export const cloneTree = (node: Pragma, parent?: Pragma): Pragma => {
  const baseClone = dsxid(node, parent);

  if (node.kind === 'text') {
    return structuredClone(baseClone);
  }

  if (node.kind === 'intrinsic') {
    const {
            children: _,
            props,
            ...rest
          } = baseClone as PragmaElement;

    const clone = structuredClone(rest);

    const {
            [onclick]       : __,
            [onselect]      : ___,
            [ondeselect]    : ____,
            [onsubmit]      : ______,
            [oninvoke]      : _______,
            [onautocomplete]: ________,
            ...restProps
          } = props;

    const clonedProps = structuredClone(restProps);

    for (const fn of [onclick, onselect, ondeselect, onsubmit, oninvoke, onautocomplete]) {
      if (props[fn]) {
        clonedProps[fn] = props[fn];
      }
    }

    return {
      ...clone,
      props   : clonedProps,
      children: node.children.map((child) => cloneTree(child, {...node, ...baseClone})),
    } as PragmaElement;
  }

  const {children: _, render, ...rest} = baseClone as PragmaFunction;
  const clone                          = structuredClone(rest);

  return {
    ...clone,
    children: node.children.map((child) => cloneTree(child, {...node, ...baseClone})),
    render,
  } as PragmaFunction;
};



export const initialRender = (node: Pragma, parent?: Pragma): Pragma => {
  const base = dsxid(node, parent);

  switch (node.kind) {
    case 'text': {
      return base;
    }
    case 'intrinsic': {
      return {
        ...base,
        children: node.children.map((child) => initialRender(child, base)),
      } as PragmaElement;
    }
    case 'function': {
      const children = renderFunctionNode(node);

      return {
        ...base,
        kind    : 'function',
        children: children.map((child: any) => initialRender(child, base)),
        render  : node.render,
        state   : node.state,
      } as PragmaFunction;
    }
  }
};



export const dispatchEvent = (node: Pragma, event: DEvent, original: Pragma = node): Pragma => {
  console.log('[dispatchEvent]', node.id_step);
  if ('props' in node) {
    if (node.id_step === event.id && node.props[event.type]) {
      if (typeof node.props[event.type] === 'function') {
        node.props[event.type](event);
        return original;
      }
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      try {
        return dispatchEvent(child, event, original);
      }
      catch (_) {
        // do nothing
      }
    }
  }

  throw new Error(`No node with id_step "${event.id}" having a handler for type "${event.type}" was not found`);
};



export const hydrateRoot = (node: Pragma, states: Hooks): Pragma => {

};



export const rerenderRoot = (root: Pragma): Pragma => {
  if (root.kind === 'text') {
    return root;
  }
  if (root.kind === 'intrinsic') {
    return root;
  }
  const current  = root.children;
  const rendered = renderFunctionNode(root);
  root.children  = renderNodes(root, current, rendered);
  return root;
};

const renderNodes = (parent: Pragma, cs: Pragma[], rs: Pragma[]): Pragma[] => {
  const length   = Math.max(cs.length, rs.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = cs.at(i);
    const r = rs.at(i);

    if (!c && !r) {
      throw new Error('Impossible');
    }
    if (!c && r) {
      __mount(r.id_full);
      children.push(initialRender(r, parent));
      continue;
    }
    if (c && !r) {
      __dismount(c.id_full);
      continue;
    }
    if (c && r) {
      if (!isSameNode(c, r)) {
        __dismount(c.id_full);
        children.push(initialRender(r, parent));
      }
      else if (c.kind === 'text') {
        children.push(c);
      }
      else if (c.kind === 'intrinsic') {
        if (!hasSameProps(c, r)) {
          c.props = (r as PragmaElement).props;
        }
        c.children = renderNodes(c, c.children, (r as PragmaElement).children);
        children.push(c);
        // else {
        //   (r as PragmaElement).children = renderNodes(c, (c).children, (r as PragmaElement).children);
        //   children.push(r);
        // }
      }
      else if (hasSameProps(c, r)) {
        if (hasSameState(c)) {
          c.children = renderNodes(c, c.children, (r as PragmaFunction).children);
          children.push(c);
        }
        else {
          const nextchildren = renderFunctionNode(c);
          c.children         = renderNodes(c, c.children, nextchildren);
          children.push(c);
        }
      }
      else {
        const nextchildren = renderFunctionNode(c);
        c.children         = renderNodes(c, c.children, nextchildren);
        children.push(c);
      }
    }
  }
  return children;
};

const renderFunctionNode = (node: PragmaFunction) => {
  __prep(node.id_full, node.state);

  const children = node.render(node.props) as any[];
  const rendered = setIds(children, node);
  node.state     = __get(node.id_full);
  node.stack     = structuredClone(node.state.stack);
  node.state.pc  = 0;
  node.state.rc++;

  return rendered;
};



const isSameNode = <A extends Pragma, B extends Pragma>(a: A, b: B) => {
  console.debug('[isSameNode]', a.id_step, b.id_step);
  if (a.kind !== b.kind) return false;
  if (a.name !== b.name) return false;
  if (a.id !== b.id) return false;
  if (a.kind === 'text') return a.value === (b as PragmaText).value;
  console.debug('[isSameNode]: true');
  return true;
};

const hasSameProps = (c: Pragma, r: Pragma) => {
  const cprops = Data.struct((c as PragmaFunction | PragmaElement).props);
  const rprops = Data.struct((r as PragmaFunction | PragmaElement).props);
  const equals = Equal.equals(cprops, rprops);
  console.debug('[hasSameProps]', cprops, rprops, equals);
  return equals;
};

const hasSameState = (c: Pragma) => {
  const connected = Data.array((c as PragmaFunction).state!.stack.map(Data.struct));
  const last      = Data.array((c as PragmaFunction).stack!.map(Data.struct));
  const equals    = Equal.equals(connected, last);
  console.debug('[hasSameState]', connected, last, equals);
  return equals;
};



const setIds = (children: Pragma[], parent: Pragma) => {
  for (let i = 0; i < children.length; i++) {
    children[i].index = i;
    children[i]       = dsxid(children[i], parent);
  }
  return children;
};
