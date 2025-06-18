import * as Diff from '#src/disreact/model/internal/core/diff.ts';
import type {Text} from '#src/disreact/model/internal/core/element.ts';
import * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Equal from 'effect/Equal';
import * as Differ from 'effect/Differ';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

const NodeDiffer = Differ.make<
  Element.Element,
  Diff.Node<Element.Element>
>({
  empty  : Diff.skip(),
  combine: (a, b) => Diff.andThen(a, b),
  diff   : (a, b) => {
    if (a === b) {
      return Diff.skip();
    }
    if (!Element.equalTag(a, b)) {
      return Diff.replace(b);
    }
    if (a.type !== b.type) {
      return Diff.replace(b);
    }
    if (Element.isText(a)) {
      if (a.text !== b.text) {
        return Diff.update(b);
      }
      return Diff.skip();
    }
    if (!Equal.equals(a.props, b.props)) {
      return Diff.update(b);
    }
    if (Element.isRest(a) || Element.isRest(b)) {
      return Diff.update(b);
    }
    return Diff.skip();
  },
  patch: (p, v) => {
    switch (p._tag) {
      case Diff.SKIP: {
        return v;
      }
      case Diff.REPLACE: {
        return p.node;
      }
      case Diff.UPDATE: {

      }
    }
  },
});

type AndThen<V, P> = {
  _tag  : 'AndThen';
  first : P;
  second: P;
};

const TextDiffer = Differ.make<
  Text,
  Diff.Skip | Diff.Update<Text>
>({
  empty  : Diff.skip(),
  combine: (a, b) => b,
  diff   : (a, b) => {
    if (a.text === b.text) {
      return Diff.skip();
    }
    return Diff.update(b);
  },
  patch: (a, b) => {
    if (a._tag === Diff.SKIP) {
      return b;
    }
    b.text = a.node.text;
    return b;
  },
});

const RestDiffer = Differ.make<
  Element.Rest,
  Diff.Skip | Diff.Update<Element.Rest>
>({
  empty  : Diff.skip(),
  combine: (a, b) => b,
  diff   : (a, b) => {
    if (a.text === b.text) {
      return Diff.skip();
    }
    return Diff.update(b);
  },
  patch: (a, b) => {},
});

const thing2 = pipe(
  TextDiffer,
  Differ.zip(RestDiffer),
  Differ.orElseEither,
);


const thing = TextDiffer.pipe(Differ.readonlyArray);

export const diffNode = (a: Element.Element, b: Element.Element): Diff.Node<Element.Element> => {
  if (a === b) {
    return Diff.skip();
  }
  if (a[Element.TypeId] !== b[Element.TypeId]) {
    return Diff.replace(b);
  }
  if (a.type !== b.type) {
    return Diff.replace(b);
  }
  if (Element.isText(a) || Element.isText(b)) {
    if (a.text !== b.text) {
      return Diff.update(b);
    }
    return Diff.skip();
  }
  if (!Equal.equals(a.props, b.props)) {
    return Diff.update(b);
  }
  return Diff.skip();
};

export const applyNodeDiff = (n: Element.Element, d: Diff.Node<Element.Element>) => {
  switch (d._tag) {
    case Diff.SKIP: {
      return E.void;
    }
    case Diff.REPLACE: {

    }
    case Diff.UPDATE: {

    }
    case Diff.RENDER: {

    }
  }
};
