import {NONE_INT, NONE_STR, Rest} from '#src/disreact/codec/abstract/index.ts';
import {Tx} from '#src/disreact/codec/abstract/rest.ts';
import {SnowFlake} from '#src/disreact/codec/schema/common/common.ts';
import {DT, E, O, RDT} from '#src/internal/pure/effect.ts';
import type {DateTime} from 'effect';
import {pipe} from 'effect';
import * as D from 'effect/Duration';
import * as S from 'effect/Schema';
import {between, DateTimeUtcFromNumber, decodeSync, encodeSync, equivalence, mutable, NumberFromString, optional, type Schema, String, Struct, tag, transformLiterals} from 'effect/Schema';


export const TWO_HALF_SECONDS = D.millis(2500);
export const TWO_SECONDS      = D.millis(2000);
export const TWO_MINUTES      = D.minutes(2);
export const FOURTEEN_MINUTES = D.minutes(14);

export const FRESH   = 'Fresh';
export const SPENT   = 'Spent';
export const ACTIVE  = 'Active';
export const EXPIRED = 'Expired';


export type Status = Schema.Type<typeof Status>;

export const Status = transformLiterals(
  ['0', FRESH],
  ['1', SPENT],
  ['2', ACTIVE],
  ['3', EXPIRED],
);



export const Type = Struct({
  _tag     : tag('Doken'),
  id       : SnowFlake,
  app_id   : optional(SnowFlake),
  token    : optional(S.Redacted(String)),
  ttl      : DateTimeUtcFromNumber,
  ephemeral: NumberFromString.pipe(between(0, 1)),
  type     : NumberFromString,
  status   : Status,
});

const MutableType = mutable(Type);
export type Type = Schema.Type<typeof MutableType>;



export const equals = equivalence(Type);
export const encode = encodeSync(Type);
export const decode = decodeSync(Type);



export const isEphemeral   = (doken: Type) => doken.ephemeral === 1;
export const isFresh       = (doken: Type) => doken.status === 'Fresh';
export const isSpent       = (doken: Type) => doken.status === 'Spent';
export const isActive      = (doken: Type) => doken.status === 'Active';
export const isModal       = (doken: Type) => doken.type === Tx.MODAL;
export const isSource      = (doken: Type) => doken.type === Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
export const isUpdate      = (doken: Type) => doken.type === Tx.UPDATE_MESSAGE;
export const isSourceDefer = (doken: Type) => doken.type === Tx.CHANNEL_MESSAGE_WITH_SOURCE;
export const isUpdateDefer = (doken: Type) => doken.type === Tx.DEFERRED_UPDATE_MESSAGE;



export const makeFresh = (config: {
  rest : any;
  time?: DateTime.Utc;
}) =>
  pipe(
    O.fromNullable(config.time),
    O.match({
      onSome: (dt) => pipe(
        DT.addDuration(dt, TWO_HALF_SECONDS),
        E.succeed,
        E.flatMap((then) => pipe(
          DT.isFuture(then),
          E.if({
            onTrue : () => E.succeed(then),
            onFalse: () => E.fail('Invalid: interaction token is no longer fresh'),
          }),
        )),
      ),
      onNone: () => pipe(
        DT.now,
        E.map((now) => DT.addDuration(now, TWO_HALF_SECONDS)),
      ),
    }),
    E.map((dt) => Type.make(
        {
          id       : config.rest.id,
          app_id   : config.rest.application_id,
          token    : RDT.make(config.rest.token),
          ttl      : dt,
          ephemeral: 0,
          type     : 0,
          status   : 'Fresh',
        },
      ),
    ),
  );



export const makeFromParams = (config: {
  id       : string;
  ttl      : number;
  ephemeral: number;
  type     : number;
  app_id?  : string;
  token?   : RDT.Redacted;
}) =>
  pipe(
    DT.make(config.ttl),
    O.getOrThrow,
    E.succeed,
    E.tap(E.logFatal('before')),
    E.flatMap((dt) => pipe(
      DT.subtractDuration(dt, TWO_MINUTES),
      DT.isFuture,
      E.tap(E.logFatal('after')),
      E.if({
        onTrue: () => E.succeed(
          Type.make(
            {
              id       : config.id,
              app_id   : config.app_id,
              token    : config.token,
              ttl      : dt,
              ephemeral: config.ephemeral,
              type     : config.type,
              status   : 'Active',
            },
            true,
          ),
        ),
        onFalse: () => E.succeed(
          Type.make(
            {
              id       : config.id,
              app_id   : config.app_id,
              token    : config.token,
              ttl      : dt,
              ephemeral: config.ephemeral,
              type     : config.type,
              status   : 'Expired',
            },
          ),
        ),
      }),
    )),
  );



export const activate = (config: {
  doken: Type;
}) =>
  pipe(
    DT.now,
    E.map((now) => DT.addDuration(now, FOURTEEN_MINUTES)),
    E.map((dt) =>
      Type.make(
        {
          ...config.doken,
          ttl   : dt,
          status: 'Active',
        },
      ),
    ),
  );



export const spend = (config: {
  doken: Type;
}) =>
  Type.make(
    {
      ...config.doken,
      status: 'Spent',
    },
  );



export type T = {
  app  : string;
  id   : string;
  token: string;
  ttl  : number;
  type : Rest.Tx;
  flags: number;
};

export type TEncoded = {
  id   : string;
  token: string;
  ttl  : string;
  type : string;
  flags: string;
};

export const initialTTL = () => Date.now() + 0;
export const deferTTL   = () => Date.now() + 0;

export const makeEmpty = (): T => ({
  app  : '',
  id   : NONE_STR,
  token: NONE_STR,
  ttl  : 0,
  type : Rest.DEFER_SOURCE,
  flags: 0,
});

export const makeFromRest = (rest: Rest.Interaction): T => ({
  app  : rest.application_id,
  id   : rest.id,
  token: rest.token,
  type : Rest.DEFER_SOURCE,
  ttl  : initialTTL(),
  flags: 0,
});

export const validateTTL = (doken: T): T | null => {
  if (doken.id === NONE_STR) {
    return null;
  }
  if (doken.ttl === NONE_INT) {
    return null;
  }
  if ((doken.ttl - 0) > Date.now()) {
    return doken;
  }
  return null;
};
