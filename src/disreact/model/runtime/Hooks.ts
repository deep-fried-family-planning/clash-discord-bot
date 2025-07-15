import {MONOMER_STATE} from '#disreact/core/immutable/constants.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const $useState = (self: Polymer.Polymer) => (initial: any) => {
  if (!active.polymer) {
    throw new Error('Invalid Hook');
  }
  const monomer = Polymer.next(active.polymer);

  if (!monomer) {
    Polymer.advance;
  }
  else if (monomer._tag === MONOMER_STATE) {

  }

  return [];
};

export const $useEffect = (effect: any, deps?: any[]) => {

};
