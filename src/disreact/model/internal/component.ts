import {EFFECT, PROMISE, SYNC} from '#src/disreact/model/internal/core/enum.ts';
import * as Element from '#src/disreact/model/internal/element.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as E from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Predicate from 'effect/Predicate';

export interface Component extends Element.Instance {
  polymer: Polymer.Polymer;
}

export const didMount = (el: Element.Element): el is Component =>
  Element.isInstance(el)
  && !!el.polymer;

export const mount = (fn: Element.Instance) => {
  const self = fn as Component;

  if (self.rs?.length) {
    throw new Error(`${self.name} already has rendered children`);
  }

  self.polymer = Polymer.empty();
  return self;
};

export const unmount = (self: Element.Instance) => {
  delete self.polymer;
  return E.void;
};

export const hydrate = (fn: Element.Instance, ps: Polymer.Bundle) => {
  const self = fn as Component;

  if (self.rs?.length) {
    throw new Error(`${self.name} already has rendered children`);
  }
  if (!self._n) {
    throw new Error(`${self.name} has no trie id`);
  }
  self.polymer = Polymer.hydrate(ps, self._n);
  return self;
};

export const dehydrate = (self: Component, ps: Polymer.Bundle) => {
  if (!self._n) {
    throw new Error(`${self.name} has no trie id`);
  }
  ps[self._n] = Polymer.dehydrate(self.polymer);
  return self.rs;
};

export const render = (self: Element.Instance): E.Effect<any> => {
  if (!didMount(self)) {
    throw new Error('Component render called before mount.');
  }

  const p = self.props!;
  const fc = self.type;

  switch (fc[Element.RunId]) {
    case SYNC: {
      return E.sync(() => fc(p));
    }
    case PROMISE: {
      return E.promise(() => fc(p) as Promise<any>);
    }
    case EFFECT: {
      return fc(p) as E.Effect<any>;
    }
  }

  return E.suspend(() => {
    const out = fc(p);

    if (Predicate.isPromise(out)) {
      fc[Element.RunId] = PROMISE;

      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      fc[Element.RunId] = EFFECT;

      return out as E.Effect<any>;
    }
    fc[Element.RunId] = SYNC;

    return E.succeed(out);
  });
};

export const effects = (self: Element.Instance) => E.suspend(() => {
  if (!didMount(self)) {
    throw new Error('Component effects called before mount.');
  }

  if (!Polymer.hasEffects(self.polymer)) {
    return E.succeed(self);
  }

  return self.polymer.pipe(
    Polymer.flush,
    E.forEach((fx) => {
      if (Proto.isAsync(fx)) {
        return E.promise(fx);
      }

      const out = fx();

      if (Predicate.isPromise(out)) {
        return E.promise(() => out);
      }
      if (E.isEffect(out)) {
        return out;
      }
      return E.void;
    }, {discard: true}),
  );
});
