import type * as El from '#src/disreact/model/entity/element.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export namespace Globals {}

export const INIT      = 0,
             REHYDRATE = 1,
             UPDATE    = 2,
             INVOKE    = 3;

export let id = 0,
           kind = undefined as undefined | number,
           root = undefined as undefined | Rehydrant.Rehydrant,
           node = undefined as undefined | El.Comp,
           poly = undefined as undefined | Polymer.Polymer;

const mutex = E.unsafeMakeSemaphore(1);
const acquire = mutex.take(1);
const release = mutex.release(1);

export const lock = (rh: Rehydrant.Rehydrant, el: El.Comp, p?: Polymer.Polymer, ph?: number) =>
  acquire.pipe(
    E.map(() => lockUnsafe(rh, el, p, ph)),
  );

export const done = release.pipe(E.map(() => {
  delete poly!.lock;
  Polymer.commit(poly!);
  doneUnsafe();
}));

export const lockUnsafe = (rh: Rehydrant.Rehydrant, el: El.Comp, p?: Polymer.Polymer, ph?: number) => {
  try {
    id++;
  }
 catch (_) {
   id = 0;
  }
  kind = ph;
  root = rh;
  node = el;
  poly = p;
};

export const doneUnsafe = () => {
  kind = undefined;
  root = undefined;
  node = undefined;
  poly = undefined;
};
