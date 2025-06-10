import type * as El from '#src/disreact/model/entity/element.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export let id   = 0,
           kind = undefined as undefined | number,
           root = undefined as undefined | Rehydrant.Rehydrant,
           node = undefined as undefined | El.Component,
           poly = undefined as undefined | Polymer.Polymer;

export const get = () => {

};

export const set = (rh: Rehydrant.Rehydrant, el: El.Component) => {
  try {id++;}
  catch (_) {id = 0;}
  root = rh;
  node = el;
  poly = Polymer.get(el);
};

export const reset = (_id?: number) => {
  if (_id) id = _id;
  kind = undefined;
  root = undefined;
  node = undefined;
  poly = undefined;
};
