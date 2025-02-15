import {deferTTL, initialTTL, type T} from '#src/disreact/codec/abstract/doken.ts';
import {Doken, NONE_STR, Rest} from '#src/disreact/codec/abstract/index.ts';
import {DokenMemory} from '#src/disreact/interface/service.ts';
import type {DecodedRoute} from '#src/disreact/codec/route-codec.ts';
import {E} from '#src/internal/pure/effect.ts';



export const makeContingencyDoken = (rest: Rest.Interaction): T => ({
  app  : rest.application_id,
  id   : rest.id,
  token: rest.token,
  type : Rest.DEFER_SOURCE,
  ttl  : initialTTL(),
  flags: 0,
});



export const makeDeferred = (doken: T): T => ({
  ...doken,
  ttl: deferTTL(),
});



export const encodeMessageDoken = (doken: Doken.T): Doken.TEncoded => {
  return {
    id   : doken.id,
    token: doken.token,
    ttl  : `${doken.ttl}`,
    type : `${doken.type}`,
    flags: `${doken.flags}`,
  };
};



export const decodeMessageDoken = (route: DecodedRoute) => Doken.validateTTL({
  app  : NONE_STR,
  id   : route.params.id,
  token: route.params.token,
  ttl  : parseInt(route.params.ttl),
  type : parseInt(route.params.type) as unknown as Rest.Tx,
  flags: parseInt(route.params.flags),
});



export const encodeDialogDoken = (doken: Doken.T) => E.gen(function * () {
  yield * E.fork(DokenMemory.save(doken));

  return {
    id   : doken.id,
    token: NONE_STR,
    ttl  : `${doken.ttl}`,
    type : `${doken.type}`,
    flags: `${doken.flags}`,
  };
});



export const decodeDialogDoken = (route: DecodedRoute) => E.gen(function * () {
  if (route.params.token !== NONE_STR) {
    throw new Error('Impossible to decode dialog doken with actual token');
  }

  const decoded = Doken.validateTTL({
    app  : NONE_STR,
    id   : route.params.id,
    token: NONE_STR,
    ttl  : parseInt(route.params.ttl),
    type : parseInt(route.params.type) as unknown as Rest.Tx,
    flags: parseInt(route.params.flags),
  });

  if (!decoded) {
    return null;
  }

  yield * nonblockingCachePrep(route.params.id);

  return decoded;
});


const nonblockingCachePrep = (id: string) => E.fork(DokenMemory.load(id));
