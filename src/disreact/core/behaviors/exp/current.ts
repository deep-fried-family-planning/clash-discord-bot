import {INTERNAL_ERROR, IS_DEV} from '#disreact/core/immutable/constants.ts';
import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import type * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import * as Polymer from '#disreact/core/internal/polymer.ts';

export let node     = undefined as undefined | Node.Nodev1,
           polymer  = undefined as undefined | Polymer.Polymer,
           document = undefined as undefined | Document.Documentold;

export type Current = {
  node    : Node.Nodev1;
  polymer : Polymer.Polymer;
  document: Document.Documentold;
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
