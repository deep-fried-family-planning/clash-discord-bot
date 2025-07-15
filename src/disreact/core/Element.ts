import * as Document from '#disreact/core/Document.ts';
import * as Event from '#disreact/core/Event.ts';
import * as FC from '#disreact/core/FC.ts';
import {ELEMENT_FRAGMENT, ELEMENT_FUNCTIONAL, ELEMENT_INTRINSIC, ELEMENT_LIST, ELEMENT_TEXT, INTRINSIC} from '#disreact/core/immutable/constants.ts';
import * as Diff from '#disreact/core/immutable/diff.ts';
import * as Diffs from '#disreact/core/immutable/diffs.ts';
import * as elem from '#disreact/core/internal/element.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Traversal from '#disreact/core/Traversable.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import type * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';

export type Element =
  | Text
  | List
  | Frag
  | Rest
  | Func;

export interface Base extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Equal.Equal,
  Hash.Hash,
  Traversal.Origin<Document.Document>,
  Traversal.Ancestor<Element>,
  Traversal.Descendent<Element>,
  Traversal.Sibling<Element>,
  Traversal.Meta
{
  readonly [elem.ElementId]: typeof elem.ElementId;

  readonly _tag     : number;
  readonly component: any;
  readonly endpoint?: string;
  readonly key      : string;
  props             : undefined | Props;
  ref               : undefined | any;
  text              : undefined | any;
  merge             : undefined | boolean;
  diff              : undefined | Diff.Diff<Element>;
  diffs             : undefined | Diffs.Diffs<Element>[];
  jsxs              : boolean;
  rendered?         : Jsx.Children;
  src?              : any;
  ctx?              : any;
}

export interface Text extends Base {
  _tag: typeof ELEMENT_TEXT;
  text: any;
}

export interface List extends Base {
  _tag: typeof ELEMENT_LIST;
}

export interface Frag extends Base {
  _tag     : typeof ELEMENT_FRAGMENT;
  component: typeof elem.FragmentSymbol;
  props    : Props;
}

export interface Rest extends Base {
  _tag     : typeof ELEMENT_INTRINSIC;
  component: string;
  props    : Props;
}

export interface Func extends Base {
  _tag     : typeof ELEMENT_FUNCTIONAL;
  component: FC.Known;
  props    : Props;
  polymer  : Polymer.Polymer;
}

export interface Props extends Inspectable.Inspectable,
  Equal.Equal,
  Hash.Hash,
  Record<'onclick' | 'onselect' | 'onsubmit', any>,
  Record<string, any>
{
  readonly children?: Jsx.Children;
}

export const isElement = elem.isElement;

export const isInvokable = (node: Element): node is Rest => node._tag === INTRINSIC;

export const isRenderable = (node: Element): node is Func => node._tag > INTRINSIC;

export const liftPropsChildren = <A extends Element>(self: A): A => {
  if (!self.props?.children) {
    return self;
  }
  if (self._tag === ELEMENT_FUNCTIONAL) {
    return self;
  }
  if (self.jsxs) {
    const children = self.props.children as Jsx.Child[];
    const elements = [] as Element[];

    for (let i = 0; i < children.length; i++) {
      elements[i] = elem.makeChildElement(children[i]);
      elem.connectChildElement(self, elements[i]);
    }
    self.children = elements;
    return self;
  }
  const child = elem.makeChildElement(self.props.children);
  elem.connectChildElement(self, child);
  self.children = [child];
  return self;
};

export const liftRenderedChildren = (self: Element, rendered: Jsx.Children): Element[] | undefined => {
  if (!rendered) {
    return undefined;
  }
  const child = elem.makeChildElement(rendered);
  elem.connectChildElement(self, child);
  return [child];
};

export const eitherRenderable = (self: Element): Either.Either<Func, Exclude<Element, Func>> => {
  if (isRenderable(self)) {
    return Either.right(self);
  }
  return Either.left(self);
};

export const toReversedDescendents = (self: Element) => self.children?.toReversed();

export const clone = <A extends Element>(self: A): A => elem.cloneElement(self);

export const findDescendentDF = <A extends Element>(self: Element, p: (n: Element) => n is A): Option.Option<A> => {
  const stack = [self] as Element[];

  while (stack.length) {
    const node = stack.pop()!;

    if (p(node)) {
      return Option.some(node);
    }
    if (node.children) {
      stack.push(...node.children.toReversed());
    }
  }
  return Option.none();
};

export const findDescendent = dual<
  <A extends Element>(p: (n: Element) => n is A) => (self: Element) => Option.Option<A>,
  <A extends Element>(self: Element, p: (n: Element) => n is A) => Option.Option<A>
>(2, (self, p) => findDescendentDF(self, p));

export const findAncestorDF = <A extends Element>(self: Element, p: (n: Element) => n is A): Option.Option<A> => {
  let node = self as Element | undefined;

  while (node) {
    if (p(node)) {
      return Option.some(node);
    }
    node = Traversal.getAncestor(node);
  }
  return Option.none();
};

export const findAncestor = dual<
  <A extends Element>(p: (n: Element) => n is A) => (self: Element) => Option.Option<A>,
  <A extends Element>(self: Element, p: (n: Element) => n is A) => Option.Option<A>
>(2, (self, p) => findAncestorDF(self, p));

export const initializeDF = (self: Func, document: Document.Document): Func => {
  self.polymer = Polymer.empty(self, document);
  return self;
};

export const initialize = dual<
  (document: Document.Document) => (self: Func) => Func,
  (self: Func, document: Document.Document) => Func
>(2, initializeDF);

const hydrateDF = (self: Func, document: Document.Document): Func => {
  self.polymer = document.pipe(
    Document.getEncoding(self.trie),
    Option.fromNullable,
    Option.map((encoded) => Polymer.hydrate(self, document, encoded)),
    Option.getOrElse(() => Polymer.empty(self, document)),
  );
  return self;
};

export const hydrate = dual<
  (document: Document.Document) => (self: Func) => Func,
  (self: Func, document: Document.Document) => Func
>(2, hydrateDF);

const disposeF = (self: Element, document: Document.Document) => {
  if (isRenderable(self)) {
    (self.polymer as any) = Polymer.dispose(self.polymer);
  }
  (self.props as any) = undefined;
  (self.diff as any) = undefined;
  (self.diffs as any) = undefined;
  self.ancestor = undefined;
  self.head = undefined;
  self.tail = undefined;
  return self;
};

export const dispose = dual<
  (document: Document.Document) => (self: Element) => Element,
  (self: Element, document: Document.Document) => Element
>(2, disposeF);

export const commitF = (output: Jsx.Children, self: Func): Func => {
  Polymer.commit(self.polymer);
  if (Polymer.isStateless(self.polymer)) {
    FC.markStateless(self.component);
  }
  self.rendered = output;
  return self;
};

export const commit = dual<
  (self: Func) => (output: Jsx.Children) => Func,
  (output: Jsx.Children, self: Func) => Func
>(2, commitF);

export const accept = (self: Func): Func => {
  self.children = liftRenderedChildren(self, self.rendered);
  delete self.rendered;
  return self;
};

const mutex = globalValue(Symbol.for('disreact/mutex'), () => E.unsafeMakeSemaphore(1));

export const render = (self: Func): E.Effect<Jsx.Children> => {
  const component = self.component;

  if (!component.state) {
    if (!component.props) {
      return FC.renderSelf(component);
    }
    return FC.renderProps(component, self.props);
  }
  if (!component.props) {
    return mutex.take(1).pipe(
      E.andThen(FC.renderSelf(component)),
      E.tap(mutex.release(1)),
      E.tapDefect(() => mutex.release(1)),
    );
  }
  return mutex.take(1).pipe(
    E.andThen(FC.renderProps(component, self.props)),
    E.tap(mutex.release(1)),
    E.tapDefect(() => mutex.release(1)),
  );
};

export const flush = (self: Func): E.Effect<Func> => E.suspend(() => {
  if (!Polymer.hasEffects(self.polymer)) {
    return E.succeed(self);
  }
  return E.die('').pipe(E.as(self));
});

export const dehydrate = (self: Func): Element[] | undefined => {
  return self.children;
};

export const invokeDF = (self: Rest, event: Event.Event) => {
  if (event.type in self.props) {
    const handler = self.props[event.type];

    return Event.invoke(event, handler);
  }
  return E.succeed(event);
};

export const invoke = dual<
  (event: Event.Event) => (self: Rest) => E.Effect<Event.Event>,
  (self: Rest, event: Event.Event) => E.Effect<Event.Event>
>(2, invokeDF);

export const diffF = (self: Element, that: Element): Diff.Diff<Element> => {
  switch (self._tag) {
    case ELEMENT_TEXT: {
      if (that._tag !== ELEMENT_TEXT) {
        return Diff.replace(that);
      }
      if (self.text !== that.text) {
        return Diff.replace(that);
      }
      return Diff.skip();
    }
    case ELEMENT_LIST: {
      if (that._tag !== ELEMENT_LIST) {
        return Diff.replace(that);
      }
      return Diff.cont(that);
    }
    case ELEMENT_FRAGMENT: {
      if (that._tag !== ELEMENT_FRAGMENT) {
        return Diff.replace(that);
      }
      return Diff.cont(that);
    }
    case ELEMENT_INTRINSIC: {
      if (that._tag !== ELEMENT_INTRINSIC) {
        return Diff.replace(that);
      }
      if (self.component !== that.component) {
        return Diff.replace(that);
      }
      if (!Equal.equals(self.props, that.props)) {
        return Diff.update(that);
      }
      return Diff.cont(that);
    }
  }
  if (that._tag !== ELEMENT_FUNCTIONAL) {
    return Diff.replace(that);
  }
  if (self.component !== that.component) {
    return Diff.replace(that);
  }
  if (!Equal.equals(self.props, that.props)) {
    return Diff.render(that.props);
  }
  if (Polymer.isChanged(self.polymer)) {
    return Diff.render(self.props);
  }
  return Diff.skip();
};

export const diff = dual<
  (that: Element) => (self: Element) => Diff.Diff<Element>,
  (self: Element, that: Element) => Diff.Diff<Element>
>(2, diffF);

export const diffsF = (self: Element, that?: Element[]): Diffs.Diffs<Element>[] => {
  const acc = [] as Diffs.Diffs<Element>[];

  if (!self.children && !that) {
    return [];
  }
  if (!self.children && that) {
    for (let i = 0; i < that.length; i++) {
      acc.push(Diffs.insert(that[i]));
    }
    return acc;
  }
  if (self.children && !that) {
    for (let i = 0; i < self.children.length; i++) {
      acc.push(Diffs.remove(self.children[i]));
    }
    return acc;
  }
  // todo
  return acc;
};

export const diffs = dual<
  (that: Element[]) => (self: Element) => Diff.Diff<Element>[],
  (self: Element, that: Element[]) => Diffs.Diffs<Element>[]
>(2, diffsF);

export const updateDF = <A extends Element>(self: A, that: Element): A => {
  if (process.env.NODE_ENV !== 'production') {
    if (self._tag !== that._tag) {
      throw new Error();
    }
  }
  switch (self._tag) {
    case ELEMENT_TEXT: {
      self.text = (that as Text).text;
      return self;
    }
    case ELEMENT_LIST: {
      return self;
    }
    case ELEMENT_FRAGMENT: {
      return self;
    }
    case ELEMENT_INTRINSIC: {
      self.props = (that as Rest).props;
      return self;
    }
    case ELEMENT_FUNCTIONAL: {
      self.props = (that as Func).props;
      return self;
    }
  }
};

export const update = dual<
  <A extends Element>(that: A) => (self: A) => A,
  <A extends Element>(self: A, that: A) => A
>(2, updateDF);

export const replaceDF = <A extends Element>(self: Element, that: A): A => {
  return that;
};

export const replace = dual<
  <A extends Element>(that: A) => (self: Element) => A,
  <A extends Element>(self: Element, that: A) => A
>(2, replaceDF);

export const prependChild = dual<
  <A extends Element>(that: A) => (self: A) => A,
  <A extends Element>(self: A, that: A) => A
>(2, (self, that) => {
  if (self.children) {
    self.children.unshift(that);
  }
  else {
    self.children = [that];
  }
  return self;
});

export const appendChild = dual<
  <A extends Element>(that: Element) => (self: A) => A,
  <A extends Element>(self: A, that: A) => A
>(2, (self, that) => {
  if (self.children) {
    self.children.push(that);
  }
  else {
    self.children = [that];
  }
  return self;
});

export const insertChild = dual<
  <A extends Element>(that: Element) => (self: A) => A,
  <A extends Element>(self: A, that: Element) => A
>(2, (self, that) => {
  if (self.children) {
    self.children.splice(self.index, 0, that);
  }
  else {
    self.children = [that];
  }
  return self;
});

export const removeChild = dual<
  <A extends Element>(that: Element) => (self: A) => A,
  <A extends Element>(self: A, that: Element) => A
>(2, (self, that) => {
  if (self.children) {
    const idx = self.children.indexOf(that);
    if (idx !== -1) {
      self.children.splice(idx, 1);
    }
  }
  return self;
});
