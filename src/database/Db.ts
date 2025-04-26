import type * as Schema from '#src/database/schema/index.ts';
import {Database} from '#src/database/arch/Database.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {ParseError} from 'effect/ParseResult';

export * from '#src/database/schema/index.ts';
export * as Db from '#src/database/Db.ts';
export type Db = never;

export type Any =
  | typeof Schema.Alliance
  | typeof Schema.DiscordEmbed
  | typeof Schema.Server
  | typeof Schema.ServerClan
  | typeof Schema.ServerInfo
  | typeof Schema.User
  | typeof Schema.UserPlayer;

export const saveItem = <A extends Any>(s: A, item: A['Type']) =>
  pipe(
    s.encode(item) as E.Effect<any, ParseError>,
    E.flatMap((enc) => Database.createItemCached(enc as any)),
  );

export const readItem = <A extends Any>(s: A, pk: string, sk: string) =>
  pipe(
    Database.readItemCached(
      s.encodeKey(pk, sk),
    ),
    E.flatMap((item) => s.decode(item) as E.Effect<A['Type'], ParseError>),
    E.tap((dec) => {
      if (!dec.upgraded) {
        return;
      }
      return E.fork(saveItem(s, dec));
    }),
  );

export const readPartition = <A extends Any>(s: A, pk: string) =>
  pipe(
    s.encodePk(pk),
    E.succeed,
    E.flatMap((enc) => Database.readPartitionCached(enc)),
    E.flatMap((partition) =>
      pipe(
        partition.map((item) =>
          pipe(
            s.decode(item) as E.Effect<A['Type'], ParseError>,
            E.catchTag('ParseError', () => E.succeed(undefined)),
            E.tap((dec) => {
              if (!dec?.upgraded) {
                return;
              }
              return E.fork(saveItem(s, dec));
            }),
          ),
        ),
        E.allWith({concurrency: 'unbounded'}),
        E.map((items) => items.filter(Boolean) as Exclude<typeof items[number], undefined>[]),
      ),
    ),
  );

export const deleteItem = <A extends Any>(s: A, pk: string, sk: string) =>
  Database.deleteItemCached(
    s.encodeKey(pk, sk),
  );
