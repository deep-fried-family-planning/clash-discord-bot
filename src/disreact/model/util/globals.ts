import type {El} from '#src/disreact/model/entity/el.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import console from 'node:console';

export const INIT      = 0,
             REHYDRATE = 1,
             UPDATE    = 2,
             INVOKE    = 3;

export const phase = undefined as undefined | number,
           lock = undefined as undefined | number,
           root  = undefined as undefined | Rehydrant.Rehydrant,
           comp  = undefined as undefined | El.Comp,
           poly  = undefined as undefined | Polymer.Polymer;

export const ctx = {
  phase: undefined as undefined | number,
  lock : undefined as undefined | number,
  root : undefined as undefined | Rehydrant.Rehydrant,
  comp : undefined as undefined | El.Comp,
  poly : undefined as undefined | Polymer.Polymer,
};

export const get = () => ctx;

const mutex: E.Semaphore = E.unsafeMakeSemaphore(1);

export const init = () => {
  // mutex = E.unsafeMakeSemaphore(1);
};

export const withPermits = () => mutex.withPermits(1);

export const withLock = <A, E, R>(rh: Rehydrant.Rehydrant, el: El.Comp, ph: number, effect: E.Effect<R, E, A>) =>
  mutex.take(1).pipe(
    E.flatMap(() => E.randomWith((random) => random.nextInt)),
    E.flatMap((random) => {
      ctx.lock = random;
      ctx.phase = ph;
      ctx.root = rh;
      ctx.comp = el;
      ctx.poly = Polymer.get(el);
      return effect.pipe(
        E.tap(() => reset(random, el)),
        E.tapDefect(() => reset(random, el)),
      );
    }),
  );

export const set = (rh: Rehydrant.Rehydrant, el: El.Comp, ph?: number) =>
  pipe(
    mutex.take(1),
    E.flatMap(() => E.randomWith((random) => random.nextInt)),
    E.tap((random) => {
      ctx.lock = random;
      ctx.phase = ph;
      ctx.root = rh;
      ctx.comp = el;
      ctx.poly = Polymer.get(el);
    }),
  );

export const reset = (id: number, el: El.Comp) => E.suspend(() => {
  const poly = Polymer.get(el);
  Polymer.commit(poly);
  if (id === ctx.lock && el === ctx.comp) {
    ctx.phase = undefined;
    ctx.lock = undefined;
    ctx.root = undefined;
    ctx.comp = undefined;
    ctx.poly = undefined;
    return mutex.release(1);
  }
  return E.void;
});

export const early = (id: number, el: El.Comp) => {
  if (id === ctx.lock && el === ctx.comp) {
    E.runSync(reset(id, el));
  }
};
