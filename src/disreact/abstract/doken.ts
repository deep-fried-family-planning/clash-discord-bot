import {NONE_STR, Rest} from '#src/disreact/abstract/index.ts';

const TWO_SECONDS_MS      = 2 * 1000;
const FOURTEEN_MINUTES_MS = 14 * 60 * 1000;
const TWO_MINUTES_MS      = 2 * 60 * 1000;

export type DokenStatus =
  | 'active'
  | 'deferred'
  | 'deleted'
  | 'done'
  | 'expired'
  | 'none';

export type T = {
  app   : string;
  id    : string;
  token : string;
  ttl   : number;
  status: DokenStatus;
  type  : Rest.Tx;
  flags : number;
};

const initialTTL = () => Date.now() + TWO_SECONDS_MS;
const deferTTL   = () => Date.now() + FOURTEEN_MINUTES_MS;

export const makeEmpty = (): T => ({
  app   : '',
  id    : NONE_STR,
  token : NONE_STR,
  ttl   : 0,
  status: 'none',
  type  : Rest.DEFER_SOURCE,
  flags : 0,
});

export const makeFromRest = (rest: Rest.Interaction): T => ({
  app   : rest.application_id,
  id    : rest.id,
  token : rest.token,
  status: 'active',
  type  : Rest.DEFER_SOURCE,
  ttl   : initialTTL(),
  flags : 0,
});

export const makeDeferred = (doken: T): T => ({
  ...doken,
  status: 'deferred',
  ttl   : deferTTL(),
});

export const invalidateTTL = (doken: T): T => {
  if ((doken.ttl - TWO_MINUTES_MS) > Date.now()) {
    return doken;
  }
  return {
    ...doken,
    status: 'expired',
  };
};

type TDokenEncoded = {
  id   : string;
  token: string;
  ttl  : string;
  type : string;
  flags: string;
};

export const encode = (doken?: T): TDokenEncoded => doken
  ? {
    id   : doken.id,
    token: doken.token,
    ttl  : `${doken.ttl}`,
    type : `${doken.type}`,
    flags: `${doken.flags}`,
  }
  : {
    id   : NONE_STR,
    token: NONE_STR,
    ttl  : '0',
    type : '0',
    flags: '0',
  };

export const decode = (encoded: TDokenEncoded): T => invalidateTTL({
  app   : NONE_STR,
  id    : encoded.id,
  token : encoded.token,
  ttl   : parseInt(encoded.ttl),
  status: 'deferred',
  type  : parseInt(encoded.type) as unknown as Rest.Tx,
  flags : parseInt(encoded.flags),
});
