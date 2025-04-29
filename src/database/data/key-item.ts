import type {DataTag} from '#src/database/data/const/index.ts';

export type PartitionKey = string;

export type CompositeKey = {
  pk: any;
  sk: any;
};

export type Item = {
  _tag: DataTag;
  pk  : any;
  sk  : any;
};

export * as KeyItem from '#src/database/data/key-item.ts';
export type KeyItem = | PartitionKey
                      | CompositeKey
                      | Item;

export type KeyLike = | PartitionKey
                      | CompositeKey;

export type ItemLike = | CompositeKey
                       | Item;

export const isPartition = (u: unknown): u is PartitionKey =>
  typeof u === 'string';

export const isComposite = (u: unknown): u is CompositeKey =>
  !!u
  && typeof u === 'object'
  && !('_tag' in u);

export const isItem = (u: unknown): u is Item =>
  !!u
  && typeof u === 'object'
  && '_tag' in u;
