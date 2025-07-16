import * as Polymer from '#disreact/entity/Polymer.ts';

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};

export const $useState = (self?: Polymer.Polymer) => (initial: any) => {
  const polymer = Polymer.assert(self);
  const monomer = Polymer.hook(
    polymer,
    Polymer.STATE,
    () => {
      const m = Polymer.reducer(initial);
      m.dispatch = (next: any) => {
        if (typeof next === 'function') {
          m.state = next(m.state);
        }
        else {
          m.state = next;
        }
        m.changed = true;
        polymer.flags.add(polymer.origin!);
      };
      return m;
    },
  );

  return [monomer.state, monomer.dispatch];
};

export const $useEffect = (self?: Polymer.Polymer) => (effect: any, deps?: any[]) => {
  const polymer = Polymer.assert(self);
};
