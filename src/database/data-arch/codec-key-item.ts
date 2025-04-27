import type {DataTag} from '#src/database/data-const/index.ts';

type ItemTags = Exclude<
  DataTag,
  | typeof DataTag.PARTITION_KEY
  | typeof DataTag.SORT_KEY
  | typeof DataTag.COMPOSITE_KEY
  | typeof DataTag.HASH_KEY
  | typeof DataTag.RANGE_KEY
>;

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

export * as KeyItem from '#src/database/data-arch/codec-key-item.ts';
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
