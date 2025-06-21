import * as Diff from '#src/disreact/model/internal/core/diff.ts';
import * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Rehydrant from '#src/disreact/model/adaptor/exp/domain/old/envelope.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Mutex from '#src/disreact/model/internal/infrastructure/mutex.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as P from 'effect/Predicate';

export const diff = (self: Element.Func, that: Element.Element): Diff.Diff<Element.Element> => {
  if (!Element.isFunc(that)) {
    return Diff.replace(that);
  }
};

export const hydrate = (n: Element.Element, rh: Rehydrant.Envelope) => {
  if (!Element.isFunc(n)) {
    return n;
  }

  if (n.polymer) {
    throw new Error(`${n.name} already has a polymer instance`);
  }
  if (n.under?.length) {
    throw new Error(`${n.name} already has rendered children`);
  }
  if (!n._n) {
    throw new Error(`${n.name} has no trie id`);
  }
  n.polymer = Polymer.hydrate(rh.trie, n._n);

  return n;
};

export const dehydrate = (n: Element.Func, rh: Rehydrant.Envelope) => {
  if (!n._n) {
    throw new Error(`${n.name} has no trie id`);
  }
  Polymer.dehydrate(rh.trie, n._n, n.polymer!);
  return n.under;
};

export const mount = (n: Element.Element, rh: Rehydrant.Envelope) => {
  if (!Element.isFunc(n)) {
    return n;
  }

  if (n.under?.length) {
    throw new Error(`${n.name} already has rendered children`);
  }
  n.polymer = Polymer.empty();

  return n;
};

export const unmount = (n: Element.Element) => E.sync(() => {
  if (Element.isFunc(n)) {
    delete n.polymer;
  }
  delete n.under;
  n.setParent(null);
});

export const render = (n: Element.Func, rh: Rehydrant.Envelope) =>
  pipe(
    Mutex.acquire(n, rh),
    E.andThen(() => {
      const p = n.props!;
      const f = n.type;

      switch (FC.kind(f)) {
        case FC.SYNC: {
          return E.sync(() => f(p) as Element.Rendered);
        }
        case FC.ASYNC: {
          return E.promise(() => f(p) as Promise<Element.Rendered>);
        }
        case FC.EFFECT: {
          return f(p) as E.Effect<Element.Rendered>;
        }
      }
      const output = f(p);

      if (P.isPromise(output)) {
        FC.cast(f, FC.AsyncPrototype);
        return E.promise(() => output);
      }
      if (E.isEffect(output)) {
        FC.cast(f, FC.EffectPrototype);
        return output as E.Effect<any>;
      }
      FC.cast(f, FC.SyncPrototype);
      return E.succeed(output);
    }),
    Mutex.release(n, rh),
    E.map((rs) => {
      Polymer.commit(n.polymer!);
      return Element.trie(n, rs);
    }),
  );

export const runEffects = (n: Element.Func) => E.suspend(() => {
  if (!Polymer.hasEffects(n.polymer!)) {
    return E.succeed(n);
  }
  return pipe(
    n.polymer!,
    Polymer.flush,
    E.forEach((f) => {
      if (type.isAsync(f)) {
        return E.promise(f);
      }
      const out = f();

      if (P.isPromise(out)) {
        return E.promise(() => out);
      }
      if (E.isEffect(out)) {
        return out;
      }
      return E.void;
    }),
    E.as(n),
  );
});

export const didMount = (el: Element.Element) =>
  Element.isFunc(el)
  && !!el.polymer;
