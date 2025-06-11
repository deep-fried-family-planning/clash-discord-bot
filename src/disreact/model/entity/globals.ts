import type * as Element from '#src/disreact/model/entity/element.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as GlobalValue from 'effect/GlobalValue';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export let id   = 0,
           kind = undefined as undefined | number,
           root = undefined as undefined | Rehydrant.Rehydrant,
           node = undefined as undefined | Element.Component,
           poly = undefined as undefined | Polymer.Polymer;

export type Globals = {
  node?: Element.Component;
  root?: Rehydrant.Rehydrant;
  poly?: Polymer.Polymer;
};

const internal: Globals = {};

export const get = () => {
  if (
    !internal.node
    || !internal.root
    || !internal.poly
  ) {
    throw new Error('Hooks must be called within a component.');
  }
  return internal as Required<Globals>;
};

export const set = (rh: Rehydrant.Rehydrant, el: Element.Component) => {
  try {id++;}
  catch (_) {id = 0;}
  internal.root = rh;
  internal.node = el;
  internal.poly = Polymer.get(el);
};

export const reset = (_id?: number) => {
  if (_id) id = _id;
  kind = undefined;
  delete internal.root;
  delete internal.node;
  delete internal.poly;
};
