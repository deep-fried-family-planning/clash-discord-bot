import type * as Schema from '#src/database/schema/index.ts';
import {DatabaseDriver} from '#src/database/DatabaseDriver.ts';
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

export const read = <A extends Any>(s: A, pk: string, sk: string) =>
  pipe(
    DatabaseDriver.cachedRead(
      s.encodeKey(pk, sk),
    ),
    E.flatMap((item) => s.decode(item) as E.Effect<A['Type'], ParseError>),
    E.tap((dec) => {
      if (!dec.upgraded) {
        return;
      }
      return pipe(
        s.encode(dec) as E.Effect<A['Encoded'], ParseError>,
        E.flatMap((enc) => DatabaseDriver.cachedSave(enc)),
        E.fork,
      );
    }),
  );

export const readPartition = <A extends Any>(s: A, pk: string) =>
  pipe(
    s.encodePk(pk),
    E.succeed,
    E.flatMap((enc) => DatabaseDriver.cachedReadPartition(enc)),
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
              return pipe(
                s.encode(dec) as E.Effect<A['Encoded'], ParseError>,
                E.flatMap((enc) => DatabaseDriver.cachedSave(enc)),
                E.fork,
              );
            }),
          ),
        ),
        E.allWith({concurrency: 'unbounded'}),
        E.map((items) => items.filter(Boolean) as Exclude<typeof items[number], undefined>[]),
      ),
    ),
  );

export const save = <A extends Any>(s: A, item: A['Type']) =>
  pipe(
    s.encode(item) as E.Effect<any, ParseError>,
    E.flatMap((enc) => DatabaseDriver.cachedSave(enc as any)),
  );

export const erase = <A extends Any>(s: A, pk: string, sk: string) =>
  DatabaseDriver.cachedErase(
    s.encodeKey(pk, sk),
  );
