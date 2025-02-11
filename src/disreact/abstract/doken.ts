import {NONE_INT, NONE_STR, Rest} from '#src/disreact/abstract/index.ts';

const TWO_SECONDS_MS      = 2 * 1000;
const FOURTEEN_MINUTES_MS = 14 * 60 * 1000;
const TWO_MINUTES_MS      = 2 * 60 * 1000;

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

export const initialTTL = () => Date.now() + TWO_SECONDS_MS;
export const deferTTL   = () => Date.now() + FOURTEEN_MINUTES_MS;

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
  if ((doken.ttl - TWO_MINUTES_MS) > Date.now()) {
    return doken;
  }
  return null;
};

export const encode = (doken?: T): TEncoded => doken
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
