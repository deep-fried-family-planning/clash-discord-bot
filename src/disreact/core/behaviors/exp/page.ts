import * as Jsx from '#disreact/adaptor/model/runtime/jsx.tsx';
import type * as FC from '#disreact/core/internal/fc.ts';
import {dual} from 'effect/Function';

export type Page = {
  id    : string | null;
  props?: any;
};

export const make = (id: string | null, props?: any): Page =>
  ({
    id   : id,
    props: props,
  });

export const close = (self: Page): Page => {
  self.id = null;
  return self;
};

export const openNode = dual<
  (n: Jsx.Jsx) => (self: Page) => Page,
  (self: Page, n: Jsx.Jsx) => Page
>(
  2, (self: Page, n: Jsx.Jsx) => {
    self.id = Jsx.sourceIdFromLookup(n);
    self.props = structuredClone(n.props);
    return self;
  },
);

export const openFC = dual<
  <A>(fc: FC.FC<A>, props: A) => (self: Page) => Page,
  <A>(self: Page, fc: FC.FC<A>, props: A) => Page
>(
  3, <A>(self: Page, fc: FC.FC<A>, props: A) => {
    self.id = Jsx.sourceIdFromLookup(fc);
    self.props = structuredClone(props);
    return self;
  },
);
