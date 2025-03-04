import {BadInteraction} from '#src/disreact/codec/error.ts';
import * as DialogParams from '#src/disreact/codec/route/dialog-params.ts';
import * as Route from '#src/disreact/codec/route/index.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {E} from '#src/internal/pure/effect.ts';
import * as FiberHash from '../codec/entities/fiber-hash.ts';
import * as Model from '../model/index.ts';



export const respond = E.fn(function* (request: any) {
  const route = Route.decodeRequestRoute(request);

  if (DialogParams.isDialogParams(route.params)) {
    return yield* new BadInteraction({});
  }

  const rootClone    = yield* StaticGraph.cloneRoot(route.params.root_id);
  const fiberRoot    = FiberHash.decode(route.params.hash);
  const hydratedRoot = yield* Model.hydrateRoot(rootClone, fiberRoot.fibers);

  route.params._tag;
});
