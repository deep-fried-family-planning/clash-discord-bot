import type {T} from '#src/disreact/abstract/event.ts';
import {cloneTree, dispatchEvent, hydrateRoot, initialRender, type Pragma, rerenderRoot} from '#src/disreact/internal/index.ts';
import type {HooksById} from '#src/disreact/internal/types.ts';
import {E} from '#src/internal/pure/effect.ts';



export const cloneTreeTry = (node: Pragma, parent?: Pragma) =>
  E.try(() => cloneTree(node, parent));

export const initialRenderTry = (node: Pragma, parent?: Pragma) =>
  E.try(() => initialRender(node, parent));

export const dispatchEventTry = (node: Pragma, event: T, original: Pragma = node) =>
  E.try(() => dispatchEvent(node, event, original));

export const hydrateRootTry = (node: Pragma, states: HooksById) =>
  E.try(() => hydrateRoot(node, states));

export const rerenderRootTry = (root: Pragma) =>
  E.try(() => rerenderRoot(root));
