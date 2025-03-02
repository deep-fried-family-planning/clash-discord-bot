import {NONE} from '#src/disreact/codec/common/index.ts';
import {DT, RDT, S} from '#src/internal/pure/effect.ts';
import type * as Route from '#src/disreact/codec/rest/route/index.ts';



const DT_FRESH_TOTAL_MS = 3000; // 3 seconds
const DT_FRESH_OFFSET_MS = 1000; // 1 second
const DT_FRESH_SAFETY_MS = DT_FRESH_TOTAL_MS - DT_FRESH_OFFSET_MS;
const DT_DEFER_TOTAL_MS = 900000; // 15 minutes
const DT_DEFER_OFFSET_MS = 120000; // 2 minutes
const DT_DEFER_SAFETY_MS = DT_DEFER_TOTAL_MS - DT_DEFER_OFFSET_MS;

const EXPIRED = -1;
const FRESH = 0;
const SPENT_SOURCE = 4;
const SPENT_UPDATE = 1;
const SPENT_DIALOG = 9;
const DEFER_SOURCE = 5;
const DEFER_UPDATE = 6;

const VALUE_PARTIAL = 'P';
const VALUE_NONE = 'N';

const NOT_SET = -1;
const PUBLIC = 0;
export const EPHEMERAL = 1;



export const T = S.Struct({
  id       : S.String,
  ttl      : S.DateTimeUtc,
  ephemeral: S.Int,
  type     : S.Int,
  value    : S.RedactedFromSelf(S.String),
});

export type T = S.Schema.Type<typeof T>;

export const isFresh = (doken: T): boolean => doken.type === FRESH;
export const isSpent = (doken: T): boolean => RDT.value(doken.value) === VALUE_NONE || doken.type === SPENT_SOURCE || doken.type === SPENT_UPDATE || doken.type === SPENT_DIALOG;
export const isDefer = (doken: T): boolean => doken.type === DEFER_SOURCE || doken.type === DEFER_UPDATE;
export const isPublic = (doken: T): boolean => doken.ephemeral === PUBLIC;
export const isEphemeral = (doken: T): boolean => doken.ephemeral === EPHEMERAL || doken.ephemeral === NOT_SET;
export const isPartial = (doken: T): boolean => !isSpent(doken) && RDT.value(doken.value) === VALUE_PARTIAL;
export const isExpired = (doken: T): boolean => DT.lessThan(doken.ttl, DT.unsafeNow());

export const makeFresh = (request: any): T => {
  return {
    id       : request.id,
    ttl      : DT.unsafeMake(Date.now() + DT_FRESH_SAFETY_MS),
    ephemeral: NOT_SET,
    component: FRESH,
    value    : RDT.make(request.token),
  };
};

export const deferFresh = (
  doken: T,
  ephemeral: number,
  type: number,
  time = DT.unsafeNow(),
): T => {
  return {
    ...doken,
    ttl      : DT.add(time, {millis: DT_DEFER_SAFETY_MS}),
    ephemeral: ephemeral,
    component: type,
  };
};

export const makeFromMessageRoute = (route: Route.Message.T): T | undefined => {
  if (
    !route.id
    || route.id === NONE
    || !route.token
    || !route.type
    || !route.ephemeral
    || !route.ttl
    || DT.unsafeIsPast(route.ttl)
  ) {
    return undefined;
  }

  return {
    id       : route.id,
    ttl      : route.ttl,
    ephemeral: route.ephemeral,
    component: route.type,
    value    : route.token,
  };
};

export const validateDecode = (doken: T): T | undefined => {
  if (isExpired(doken)) {
    return undefined;
  }
  return doken;
};

export const validateEncode = (doken: T) => {
  if (isExpired(doken)) {
    throw new Error('Token is expired.');
  }

  if (isPublic(doken)) {
    return {
      doken: {
        ...doken,
        value: RDT.make(VALUE_PARTIAL),
      },
      removed: RDT.value(doken.value),
    };
  }

  if (isSpent(doken)) {
    return {
      doken: {
        ...doken,
        id   : NONE,
        ttl  : DT.unsafeMake(0),
        value: RDT.make(VALUE_PARTIAL),
      },
    };
  }

  return {
    doken,
  };
};
