import {type Doken, Rest} from '#src/disreact/abstract/index.ts';
import { NONE_STR} from '#src/disreact/abstract/index.ts';
import {DokenMemory} from '#src/disreact/interface/service.ts';
import type {DecodedRoute} from '#src/disreact/internal/codec/route-codec.ts';
import {E} from '#src/internal/pure/effect.ts';

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



export const encodeMessageDoken = () => {

};



export const decodeMessageDoken = (route: DecodedRoute) => {

};



export const encodeDialogDoken = (doken: Doken.T) => {

};



export const decodeDialogDoken = (route: DecodedRoute) => E.gen(function * () {
  yield * E.fork(DokenMemory.lookup(route.params.id));
});
