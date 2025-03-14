/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import {CallbackType, Flag, Id} from '#src/disreact/codec/enum/index.ts';
import type {DokenMemoryError} from '#src/disreact/codec/error.ts';
import * as DAPI from '#src/disreact/codec/wire/dapi.ts';
import {ForbiddenEffect, ForbiddenSync, Redaction, RedactionTerminus, UtcNow} from '#src/disreact/codec/wire/shared/shared.ts';
import {DokenMem} from '#src/disreact/interface/DokenMemory.ts';
import {DT, E, RDT} from '#src/internal/pure/effect.ts';
import type {Cause} from 'effect';
import {DateTime, ParseResult, pipe} from 'effect';
import {DateTimeUtcFromNumber, DateTimeUtcFromSelf, mutable, optional, Struct, TaggedStruct, TemplateLiteralParser, transform, transformOrFail, UndefinedOr, Union} from 'effect/Schema';
import * as dapi from '#src/disreact/codec/dapi/index.ts';
import * as Ix from './ix.ts';



export const BaseDoken = Struct({
  id  : dapi.InteractionId,
  app : Redaction,
  user: Redaction,
  val : Redaction,
});

export const CACHE = 'Cache' as const;
export const Cache = TaggedStruct(
  CACHE,
  {
    ...BaseDoken.fields,
    type: CallbackType.Defer,
    flag: Flag.Defined,
    ttl : DateTimeUtcFromSelf,
  },
);

export const DEFER = 'Defer' as const;
export const Defer = TaggedStruct(
  DEFER,
  {
    ...BaseDoken.fields,
    type: CallbackType.Defer,
    flag: Flag.Defined,
    ttl : DateTimeUtcFromSelf,
  },
);

export const FRESH = 'Fresh' as const;
export const Fresh = TaggedStruct(
  FRESH,
  {
    ...BaseDoken.fields,
    type: CallbackType.All,
    flag: Flag.All,
    ttl : UtcNow,
  },
);

export const SPENT = 'Spent' as const;
export const Spent = TaggedStruct(
  SPENT,
  {
    ...BaseDoken.fields,
    type: CallbackType.Spent,
    flag: Flag.Defined,
  },
);

export const MaybeDefer = Defer.pipe(UndefinedOr);

export const WithTtl = Union(
  Cache,
  Defer,
  Fresh,
);



export const FRESH_MS         = 2000 as const;
export const FreshFromRequest = transformOrFail(
  Ix.BaseRequest,
  Fresh,
  {
    strict: true,
    decode: (request) =>
      pipe(
        DateTime.now,
        E.map((now) =>
          ({
            _tag: FRESH,
            id  : request.id,
            app : request.application_id,
            user: request.user_id,
            type: CallbackType.FRESH,
            flag: Flag.FRESH,
            val : request.token,
            ttl : DateTime.add(now, {millis: FRESH_MS}),
          }),
        ),
      ),
    encode: ForbiddenEffect,
  },
);

const validTTL = (ttl: DateTime.Utc) =>
  pipe(
    DateTime.isFuture(ttl),
    E.if({
      onFalse: () => E.fail(new ParseResult.Unexpected(ttl, 'Expired TTL')),
      onTrue : () => E.succeed(ttl),
    }),
  );



export const SpentFromFresh = transformOrFail(
  Fresh,
  Spent,
  {
    strict: true,
    decode: (fresh) =>
      pipe(
        validTTL(fresh.ttl),
        E.as({
          _tag: SPENT,
          id  : fresh.id,
          app : fresh.app,
          user: fresh.user,
          type: fresh.type as any,
          flag: fresh.flag as any,
          val : fresh.val,
        }),
      ),
    encode: ForbiddenEffect,
  },
);

export const DEFER_MIN      = 12 as const;
export const DeferFromFresh = transformOrFail(
  Fresh,
  Defer,
  {
    strict: true,
    decode: (fresh) =>
      pipe(
        validTTL(fresh.ttl),
        E.map((now) =>
          ({
            _tag: DEFER,
            id  : fresh.id,
            app : fresh.app,
            user: fresh.user,
            type: fresh.type as any,
            flag: fresh.flag as any,
            ttl : DateTime.add(now, {minutes: DEFER_MIN}),
            val : fresh.val,
          }),
        ),
      ),
    encode: ForbiddenEffect,
  },
);

export const CacheFromDefer = transform(
  Defer,
  Cache,
  {
    strict: true,
    decode: (defer) =>
      ({
        _tag: CACHE,
        id  : defer.id,
        app : defer.app,
        user: defer.user,
        type: defer.type,
        flag: defer.flag,
        ttl : defer.ttl,
        val : defer.val,
      }),
    encode: ForbiddenSync,
  },
);



export const CacheFromDeferMemory = transformOrFail(
  Defer,
  CacheFromDefer,
  {
    strict: true,
    decode: (defer) =>
      pipe(
        DokenMem.save(defer),
        E.fork,
        E.ignore,
        E.as(defer),
      ),
    encode: ForbiddenEffect,
  },
);

export const MaybeDeferFromCacheMemory = transformOrFail(
  Cache,
  MaybeDefer,
  {
    strict: true,
    decode: (cache) =>
      pipe(
        DokenMem.load(cache.id),
        E.catchAll(() => E.succeed(undefined)),
      ),
    encode: ForbiddenEffect,
  },
);

export const MaybeDeferFromAnyMemory = transform(
  Union(Defer, Cache, Spent),
  Union(MaybeDefer, MaybeDeferFromCacheMemory),
  {
    strict: true,
    decode: (doken) => doken._tag === SPENT ? undefined : doken,
    encode: ForbiddenSync,
  },
);



export const CACHE_PREFIX = 'c' as const;
export const DEFER_PREFIX = 'd' as const;
export const SPENT_PREFIX = 's' as const;

export const CachePack = transform(
  TemplateLiteralParser(
    CACHE_PREFIX,
    '/', CallbackType.Defer,
    '/', Flag.Defined,
    '/', dapi.InteractionId,
    '/', DateTimeUtcFromNumber,
  ),
  Cache,
  {
    strict: true,
    decode: ([, , type, , flag, , id, , ttl]) =>
      ({
        _tag: CACHE,
        id,
        app : RDT.make(''),
        user: RDT.make(''),
        type,
        flag,
        ttl,
        val : RDT.make(''),
      }),
    encode: ({id, type, flag, ttl}) =>
      [
        CACHE_PREFIX, '/', type, '/', flag, '/', id, '/', ttl,
      ] as const,
  },
);

export const DeferPack = transform(
  TemplateLiteralParser(
    DEFER_PREFIX,
    '/', CallbackType.Defer,
    '/', Flag.Defined,
    '/', dapi.SnowFlake,
    '/', DateTimeUtcFromNumber,
    '/', RedactionTerminus,
  ),
  Defer,
  {
    strict: true,
    decode: ([, , type, , flag, , id, , ttl, , val]) =>
      ({
        _tag: DEFER,
        id,
        app : RDT.make(''),
        user: RDT.make(''),
        type,
        flag,
        ttl,
        val,
      }),
    encode: ({id, type, flag, ttl, val}) =>
      [
        DEFER_PREFIX, '/', type, '/', flag, '/', id, '/', ttl, '/', val,
      ] as const,
  },
);

export const SpentPack = pipe(
  TemplateLiteralParser(
    SPENT_PREFIX,
    '/', CallbackType.Spent,
    '/', Flag.Defined,
    '/', Id.SnowFlake,
  ),
  transform(
    Spent,
    {
      strict: true,
      decode: ([, , type, , flag, , id]) =>
        ({
          _tag: SPENT,
          id,
          app : RDT.make(''),
          user: RDT.make(''),
          type,
          flag,
          val : RDT.make(''),
        }),
      encode: ({id, type, flag}) =>
        [
          SPENT_PREFIX, '/', type, '/', flag, '/', id,
        ] as const,
    },
  ),
);

export const Pack = Union(
  CachePack,
  DeferPack,
  SpentPack,
);



export type Cache = typeof Cache.Type;
export type Defer = typeof Defer.Type;
export type MaybeDefer = typeof MaybeDefer.Type;
export type Fresh = typeof Fresh.Type;
export type Spent = typeof Spent.Type;
export type Pack = typeof Pack.Type;
export type WithTtl = typeof WithTtl.Type;
export type T = Cache | Defer | Fresh | Spent;

export type Err = DokenMemoryError | Cause.UnknownException;



export const Dokens = pipe(
  Struct({
    fresh: Fresh.pipe(mutable),
    defer: optional(MaybeDeferFromAnyMemory.pipe(mutable)),
  }),
  mutable,
);

const validateTTL = <A extends WithTtl>(self: A) =>
  pipe(
    DT.isFuture(self.ttl),
    E.if({
      onFalse: () => E.fail(new ParseResult.Unexpected(self.ttl, 'Expired TTL')),
      onTrue : () => E.succeed(self),
    }),
  );

const validateTTLCodec = () =>
  ({
    strict: true,
    encode: <A extends WithTtl>(self: A) => validateTTL(self),
    decode: <A extends WithTtl>(self: A) => validateTTL(self),
  });

const validateTTLCodec2 = (schema: typeof WithTtl) => transformOrFail(schema, schema, {
  strict: true,
  encode: validateTTL,
  decode: validateTTL,
});

export const CacheValid = transformOrFail(
  Cache,
  Cache,
  validateTTLCodec(),
);

export const DeferValid = transformOrFail(
  Defer,
  Defer,
  validateTTLCodec(),
);

export const FreshValid = transformOrFail(
  Fresh,
  Fresh,
  validateTTLCodec(),
);

export const makeEmptySpent = (): Spent =>
  Spent.make({
    id  : EMPTY,
    app : RDT.make(EMPTY),
    user: RDT.make(EMPTY),
    type: 4,
    flag: 0,
    val : RDT.make(EMPTY),
  });


// export const make = (request: DAPI.Input): E.Effect<Fresh> =>
//   pipe(
//     DT.now,
//     E.map((now) =>
//       Doken.Fresh.make({
//         id  : request.id,
//         type: CallbackType.FRESH,
//         flag: Flag.FRESH,
//         val : request.token,
//         ttl : DT.add(now, {millis: FRESH_MS}),
//       }),
//     ),
//   );
//
// export const defer = (self: Fresh, type: CallbackType.Defer, flag: Flag.Defined): E.Effect<Defer> =>
//   pipe(
//     DT.now,
//     E.map((now) =>
//       Doken.Defer.make({
//         id  : self.id,
//         type: type,
//         flag: flag,
//         ttl : DT.add(now, {minutes: DEFER_MIN}),
//         val : self.val,
//       }),
//     ),
//   );
//
// export const detach = (self: Defer): E.Effect<Cache, DokenError, DokenMemory> =>
//   pipe(
//     DokenMemory.save(self),
//     E.fork,
//     E.as(
//       Doken.Cache.make({
//         id  : self.id,
//         type: self.type,
//         flag: self.flag,
//         ttl : self.ttl,
//         val : self.val,
//       }),
//     ),
//   );
//
// export const resolve = (self: Cache): E.Effect<Defer | undefined, DokenError, DokenMemory> =>
//   pipe(
//     DokenMemory.load(self.id),
//     E.map((doken) =>
//       doken
//         ? Doken.Defer.make({
//           id  : self.id,
//           type: self.type,
//           flag: self.flag,
//           ttl : self.ttl,
//           val : doken.val,
//         })
//         : undefined,
//     ),
//   );
//
// export const validate = (self: WithTtl): E.Effect<WithTtl | undefined> =>
//   pipe(
//     DT.isFuture(self.ttl),
//     E.map((isFuture) =>
//       isFuture
//         ? self
//         : undefined,
//     ),
//   );
//
// export const spend = (self: Fresh, type: CallbackType.Spent, flag: Flag.Defined): Spent =>
//   Spent.make({
//     id  : self.id,
//     type: type,
//     flag: flag,
//     val : self.val,
//   });
