import type * as DbSchema from '#src/database/schema/index.ts';
import {Database} from '#src/database/arch/Database.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {ParseError} from 'effect/ParseResult';

export * from '#src/database/schema/index.ts';
export * as Db from '#src/database/schema-methods.ts';
export type Db = never;

export const saveItem = <A extends DbSchema.Any>(s: A, item: A['Type']) =>
  pipe(
    s.encode(item) as E.Effect<any, ParseError>,
    // E.tap((enc) => Database.createItemCached(enc as any)),
    E.tap((enc) => console.log('saveItem', enc)),
  );

export const decodeUpgradeItem = <A extends DbSchema.Any>(s: A, item: unknown) =>
  pipe(
    s.decode(item) as E.Effect<A['Type'], ParseError>,
    E.catchTag('ParseError', () => E.succeed(undefined)),
    E.tap((dec) =>
      dec?.upgraded
        ? E.fork(saveItem(s, dec))
        : undefined,
    ),
  );

export const decodeUpgradeItems = <A extends DbSchema.Any>(s: A, items: unknown[]) =>
  pipe(
    items.map((item) =>
      decodeUpgradeItem(s, item),
    ),
    E.allWith({concurrency: 'unbounded'}),
    E.map((items) => items.filter((item) => !!item)),
  );

export const readItem = <A extends DbSchema.Any>(s: A, pk: string, sk: string) =>
  pipe(
    Database.readItemCached(
      s.encodeKey(pk, sk),
    ),
    E.flatMap((item) => decodeUpgradeItem(s, item)),
  );

export const readPartition = <A extends DbSchema.Any>(s: A, pk: string) =>
  pipe(
    Database.readPartitionCached(s.encodePk(pk)),
    E.flatMap((items) => decodeUpgradeItems(s, items)),
  );

export const deleteItem = <A extends DbSchema.Any>(s: A, pk: string, sk: string) =>
  Database.deleteItemCached(
    s.encodeKey(pk, sk),
  );
