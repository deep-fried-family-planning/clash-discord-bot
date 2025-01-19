import {E, L, pipe} from '#pure/effect';
import {Co, type DA, Df, Ev, In} from '#src/internal/disreact/model/entities/index.ts';
import {MainRoute} from '#src/internal/disreact/model/route/index.ts';
import {DisReactContext} from '#src/internal/disreact/runtime/layers/disreact-context.ts';
import {Renderer} from '#src/internal/disreact/runtime/layers/dom-renderer.ts';
import {DOMInstance} from '#src/internal/disreact/runtime/layers/dom.ts';
import {VDOMInstance} from '#src/internal/disreact/runtime/layers/vdom.ts';
import {dismount, mount, simulate, update} from '#src/internal/disreact/runtime/lifecycle/lifecycles.ts';
import {Fiber} from 'effect';


export const interact = E.fn('DisReact.interact')(
  function * (rest: DA.Ix) {
    const im   = yield * In.decodeInteraction(rest);

    yield * DisReactContext.allocate(im);
    yield * Renderer.allocate(im.prev_defer);

    const root = im.routes.main.params.root;
    const node = im.routes.main.params.node;
    const initial = yield * mount(root, node);


    if (In.isSubmit(im)) {
      const dialog = yield * dismount();

      const message = yield * update(Ev.Relay({
        id       : im.routes.dialog.params.id,
        container: dialog.container,
      }));

      return;
    }


    yield * update(Ev.Restore({container: im.container}));
    yield * update(Ev.Hydrate());


    const fork_sim  = yield * simulate(im.event);
    const sync_sim = yield * VDOMInstance.collect();


    if (sync_sim.close) {
      const fork_render = yield * Renderer.delete();

      return yield * Fiber.awaitAll([fork_sim, fork_render]);
    }


    if (sync_sim.next_node === initial.node.node_name) {
      return;
    }


    const dismounted = yield * dismount();
    const next       = yield * mount(root, sync_sim.next_node);

    const defer = yield * Renderer.defer(next.node.onMountDefer);

    const nextRoute = pipe(
      im.routes.main,
      MainRoute.setNode(next.node.node_name),
      MainRoute.setId(next.node.node_name),
      MainRoute.setDefer(Df.encodeDefer(next.node.onMountDefer)),
    );

    if (next.node._tag === 'Dialog') {
      yield * update(Ev.Relay({
        id       : im.curr_id,
        container: dismounted.container,
      }));
      const dialog = yield * VDOMInstance.collect();

      const encoded = pipe(
        dialog.container,
        Co.encodeDialog(nextRoute),
      );

      // todo save dismounted

      return yield * Renderer.render(encoded);
    }

    yield * update(Ev.None());

    const message = yield * VDOMInstance.collect();

    yield * Fiber.join(defer);
    yield * E.fork(Renderer.render(pipe(
      message.container,
      Co.encodeMessage(nextRoute),
    )));
  },
  E.provide(pipe(
    L.empty,
    L.provideMerge(DOMInstance.makeInstance()),
    L.provideMerge(VDOMInstance.makeInstance()),
    L.provideMerge(Renderer.makeInstance()),
    L.provideMerge(DisReactContext.makeLayer()),
  )),
);
