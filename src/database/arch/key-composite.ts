export * as KeyComposite from '#src/database/arch/key-composite.ts';
export type KeyComposite =
  | Comp
  | Item<{_tag: string}>
  | Lookup
  | Known;

export type Comp = {
  pk: string;
  sk: string;
};

export const isComp = (k: unknown): k is Comp =>
  !!k &&
  typeof k === 'object' &&
  'pk' in k &&
  'sk' in k;

export type Item<A = {_tag: string}> = A & Comp;

export const isItem = <A extends {_tag: string}>(k: unknown): k is Item<A> =>
  !!k &&
  typeof k === 'object' &&
  'pk' in k &&
  'sk' in k &&
  '_tag' in k &&
  !('_comp' in k);

export type Lookup = `${string}/${string}`;

export const isLookup = (k: unknown): k is Lookup =>
  typeof k === 'string';

export type Known = {
  _tag : string;
  _comp: true;
  pk   : string;
  sk   : string;
};

export const isKnown = (k: unknown): k is Known =>
  !!k &&
  typeof k === 'object' &&
  '_tag' in k &&
  '_comp' in k;

export const toLookup = (item: Comp | Known | Item) => `${item.pk}/${item.sk}`;
