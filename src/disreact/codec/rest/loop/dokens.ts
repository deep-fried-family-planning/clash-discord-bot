import {S} from '#src/internal/pure/effect.ts';
import * as Doken from '#src/disreact/codec/rest/loop/doken.ts';
import * as Routing from '#src/disreact/codec/rest/route/index.ts';



export const T = S.Struct({
  fresh: Doken.T.pipe(S.mutable),
  defer: S.optional(Doken.T.pipe(S.mutable)),
});

export type T = S.Schema.Type<typeof T>;

export const make = (
  request: any,
  routing?: Routing.T,
): T => {
  const fresh = Doken.makeFresh(request);

  if (!routing) {
    return {fresh};
  }

  if (Routing.isComponent(routing)) {
    return {fresh};
  }

  if (Routing.isDialog(routing)) {
    if (!routing.message) {
      return {fresh};
    }

    return {
      fresh,
      defer: Doken.makeFromMessageRoute(routing.message),
    };
  }

  return {
    fresh,
    defer: Doken.makeFromMessageRoute(routing),
  };
};

export const validateEncode = (dokens: T) => {

};



export const getDefined = (dokens: T): Doken.T => dokens.defer ?? dokens.fresh;
