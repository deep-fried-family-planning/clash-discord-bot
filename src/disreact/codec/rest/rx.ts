import * as FiberRoot from '#src/disreact/codec/dsx/fiber/fiber-root.ts';
import * as Event from '#src/disreact/codec/dsx/event/index.ts';
import * as Dokens from '#src/disreact/codec/rest/loop/dokens.ts';
import * as Loop from '#src/disreact/codec/rest/loop.ts';
import * as Route from '#src/disreact/codec/rest/route/index.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  request: S.Any,
  dokens : Dokens.T,
  event  : Event.T,
  routes : Loop.T,
});

export type T = S.Schema.Type<typeof T>;

export const make = (request: any): T => {
  const routes = Loop.extract(request);

  let dokens: Dokens.T;

  if (routes.dialog) {
    if (routes.message) {
      dokens = Dokens.make(request, routes.message);
    }
    else {
      dokens = Dokens.make(request, routes.dialog);
    }
  }
  else if (routes.message)
    dokens = Dokens.make(request, routes.message);
  else {
    dokens = Dokens.make(request, routes.message);
  }

  return {
    request,
    dokens,
    event: Event.make(request),
    routes,
  };
};
