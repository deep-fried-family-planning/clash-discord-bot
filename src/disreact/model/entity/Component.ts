import {unsafeComponent} from '#disreact/model/entity/Element.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import type * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as Effect from 'effect/Effect';
import {dual, flow} from 'effect/Function';
import type * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';

type FCKind = | 'Sync'
              | 'Async'
              | 'Effect'
              | undefined;

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable,
  Hash.Hash
{
  _tag        : K;
  _id         : string;
  _state      : boolean;
  _props      : boolean;
  entrypoint? : string | undefined;
  displayName?: string;
  source      : string;
  <P = any, E = never, R = never>(props?: P):
    K extends 'Sync' ? Jsx.Children :
    K extends 'Async' ? Promise<Jsx.Children> :
    K extends 'Effect' ? Effect.Effect<Jsx.Children, E, R> :
    | Jsx.Children
    | Promise<Jsx.Children>
    | Effect.Effect<Jsx.Children, E, R>;
}

export declare namespace Component {

}

export interface Component extends Element.Element {
  type: FC;
}

export const isComponentOrDie = flow(
  Option.liftPredicate(Element.isComponent),
  Effect.orDie,
);

export const mount = (self: Element.Element) => {
  return self;
};

export const hydrate = dual<
  (that: Polymer.Bundle) => (self: Element.Element) => Element.Element,
  (self: Element.Element, that: Polymer.Bundle) => Element.Element
>(2, (input, encoding) =>
  input.pipe(
    unsafeComponent,
    Polymer.fromComponent,
    Polymer.hydrate(encoding),
    Polymer.toComponent,
  ),
);



export const render = (elem: Component): Effect.Effect<Jsx.Children> => {
  const self = elem;
  const fc = self.type;

  switch (fc._tag) {
    case 'Sync': {
      return Effect.sync(() => fc(self.props) as Jsx.Children);
    }
    case 'Async': {
      return Effect.promise(() => fc(self.props) as Promise<Jsx.Children>);
    }
    case 'Effect': {
      return Effect.suspend(() => fc(self.props) as Effect.Effect<Jsx.Children>);
    }
  }
  return Effect.suspend(() => {
    const children = fc(self.props);

    if (Predicate.isPromise(children)) {
      fc._tag = 'Async';
      return Effect.promise(() => children);
    }
    if (!Effect.isEffect(children)) {
      fc._tag = 'Sync';
      return Effect.succeed(children);
    }
    fc._tag = 'Effect';
    return children;
  });
};

export const unmount = (self: Element.Element) => Effect.sync(() => {
  self.ancestor = undefined;
  self.children = undefined;
  (self._env as any) = undefined;
  (self.props as any) = undefined;

  if (self.polymer) {
    (self.polymer as any) = Polymer.dispose(self.polymer);
  }
});
