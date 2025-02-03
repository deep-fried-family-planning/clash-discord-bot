/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */
import {dsxid} from '#src/disreact/dsx/pragma.tsx';
import type {Pragma, PragmaElement, PragmaFunction} from '#src/disreact/dsx/types.ts';
import {getHookState, setDispatcher, setHookState} from '#src/disreact/internal/globals.ts';



export const cloneTree = (node: Pragma, parent?: Pragma): Pragma => {
  const baseClone = dsxid(node, parent);

  switch (node.kind) {
    case 'text': {
      return structuredClone(baseClone);
    }
    case 'intrinsic': {
      const {children: _, ...rest} = baseClone as PragmaElement;
      const clone = structuredClone(rest);
      return {
        ...clone,
        children: node.children.map((child) => cloneTree(child, {...node, ...baseClone})),
      } as PragmaElement;
    }
    case 'function': {
      const {render, children: _, ...rest} = baseClone as PragmaFunction;

      const clone = structuredClone(rest);

      return {
        ...clone,
        children: node.children.map((child) => cloneTree(child, {...node, ...baseClone})),
        render,
      } as PragmaFunction;
    }
  }
};



export const initialRenderTree = (node: Pragma, parent?: Pragma): Pragma => {
  const base = dsxid(node, parent);

  switch (node.kind) {
    case 'text': {
      return base;
    }
    case 'intrinsic': {
      return {
        ...base,
        children: node.children.map((child) => initialRenderTree(child, base)),
      } as PragmaElement;
    }
    case 'function': {
      const state = setHookState(node.id_full);
      setDispatcher(state);

      const renderedChildren = node.render({...node.props});

      node.state = getHookState(node.id_full);

      return {
        ...base,
        kind    : 'function',
        children: renderedChildren.map((child: any) => initialRenderTree(child, base)),
        render  : node.render,
        state   : node.state,
      } as PragmaFunction;
    }
  }
};



export const renderTree = (node: Pragma, parent?: Pragma): Pragma => {
  if (!parent) {
    switch (node.kind) {
      case 'text':{
        return node;
      }
      case 'intrinsic': {
        node.children = node.children.map((child) => renderTree(child, node));
        return node;
      }
      case 'function': {
        const nextchildren = node.render(node.props);
        return node;
      }
    }
  }
};
