import {Database} from '#src/database/service/Database.ts';
import type {Codec} from '#src/database/arch-data/codec.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {ParseError} from 'effect/ParseResult';

export * from '#src/database/arch-data/codec.ts';
export * as Db from '#src/database/db.ts';
export type Db = never;

export const saveItem = <A extends Codec>(s: A, item: A['_']) =>
  pipe(
    s.encode(item) as E.Effect<any, ParseError>,
    // E.tap((enc) => Database.createItemCached(enc as any)),
    E.tap((enc) => console.log('saveItem', enc)),
  );

export const decodeUpgradeItem = <A extends Codec>(s: A, item: unknown) =>
  pipe(
    s.decode(item) as E.Effect<A['_'], ParseError>,
    E.catchTag('ParseError', () => E.succeed(undefined)),
    E.tap((dec) =>
      dec?.upgraded
        ? E.fork(saveItem(s, dec))
        : undefined,
    ),
  );

export const decodeUpgradeItems = <A extends Codec>(s: A, items: unknown[]) =>
  pipe(
    items.map((item) => decodeUpgradeItem(s, item)),
    E.allWith({concurrency: 'unbounded'}),
    E.map((items) => items.filter((item) => !!item)),
  );

export const readItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  pipe(
    Database.readItemCached(s, pk, sk),
    E.flatMap((item) => decodeUpgradeItem(s, item)),
  );

export const readPartition = <A extends Codec>(s: A, pk: string) =>
  pipe(
    Database.scanPartitionEntirelyCached(s, pk),
    E.flatMap((items) => decodeUpgradeItems(s, items)),
  );

export const deleteItem = <A extends Codec>(s: A, pk: string, sk: string) =>
  Database.deleteItemCached(s, {pk, sk});
