import {INTERNAL_ERROR, IS_DEV} from '#src/disreact/core/primitives/constants.ts';
import type * as Document from '#src/disreact/core/primitives/document.ts';
import type * as Node from '#src/disreact/core/primitives/nodev1.ts';
import * as Polymer from '#src/disreact/core/primitives/polymer.ts';

export let node     = undefined as undefined | Node.Nodev1,
           polymer  = undefined as undefined | Polymer.Polymer,
           document = undefined as undefined | Document.Document;

export type Current = {
  node    : Node.Nodev1;
  polymer : Polymer.Polymer;
  document: Document.Document;
};

export const get = () => {
  if (!node || !polymer || !document) {
    throw new Error('Hooks must be called within a component managed by Disreact.');
  }
  return {
    node    : node,
    polymer : polymer,
    document: document,
  } as Current;
};

export const set = (p?: Polymer.Polymer) => {
  if (IS_DEV && !p) {
    throw new Error(INTERNAL_ERROR);
  }
  polymer = p;
  node = Polymer.toNode(p!);
  document = Polymer.toDocument(p!);
};

export const reset = () => {
  node = undefined;
  polymer = undefined;
  document = undefined;
};

export let early = () => {};

export const runEarly = () => {
  early();
};

export const setEarly = (f: () => void) => {
  early = f;
};
