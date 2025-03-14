import {CLOSE, EMPTY} from '#src/disreact/codec/constants/common.ts';
import type * as FunctionElement from '#src/disreact/model/entity/task-element.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import {BadInteraction} from '#src/disreact/codec/error.ts';
import {DialogParams, Doken, Dokens, Rest, Route} from '#src/disreact/codec/rest/index.ts';
import {InteractionDOM} from '#src/disreact/interface/InteractionDOM.ts';
import {DokenCache} from '#src/disreact/interface/DokenCache.ts';
import {OldRoot} from '#src/disreact/model/RootRegistry.ts';
import * as Globals from '#src/disreact/model/a/globals.ts';
import * as Lifecycles from '#src/disreact/model/a/index.ts';
import {InteractionBroker} from '#src/disreact/runtime/service/InteractionBroker.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RouteCodec} from '../codec';



export const interact = E.fn(
  function* (rest: Rest.Ix) {
    const route = Route.decodeRouteFromRequest(rest);

    if (DialogParams.is(route.params)) {
      return yield* new BadInteraction({why: 'unsupported interaction'});
    }

    yield* E.fork(Dokens.resolvePartial(route.dokens));

    const root = yield* OldRoot.hydrateClone(rest.id, route.params.root_id, route.params.hash);

    Globals.setPointer(root.pointer);
    Globals.mountRoot(root.pointer, root.fiber);

    const hydrated = yield* Lifecycles.hydrateRoot(root.element, root.fiber.fibers);

    yield* flushHooks(hydrated);

    const afterEvent = Lifecycles.invokeIntrinsicTarget(hydrated, route.event) as any;
    root.fiber       = Globals.readRoot(root.pointer);

    const localMutex = yield* InteractionBroker.mutex();

    if (root.fiber.next.id === CLOSE) {
      if (route.dokens.defer) {
        yield* E.fork(InteractionDOM.discard(route.dokens.fresh));
        yield* E.fork(DokenCache.free(route.dokens.defer.id));
        return yield* E.fork(InteractionDOM.dismount(
          rest.application_id,
          route.dokens.defer,
        ));
      }

      yield* E.fork(InteractionDOM.discard(route.dokens.fresh).pipe(localMutex));
      return yield* E.fork(InteractionDOM.dismount(
        rest.application_id,
        route.dokens.fresh,
      ).pipe(localMutex));
    }



    if (
      root.fiber.next.id === EMPTY
      || root.fiber.next.id === root.root_id
    ) {
      root.fiber.next.id = root.root_id;

      if (route.dokens.defer) {
        yield* E.fork(InteractionDOM.discard(route.dokens.fresh));
      }
      else {
        route.dokens.fresh.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
        route.dokens.fresh      = Doken.makeDeferred(route.dokens.fresh);

        yield* E.fork(DokenCache.save(route.dokens.fresh));
        yield* E.fork(InteractionDOM.defer(route.dokens.fresh).pipe(localMutex));
      }

      const rerendered = yield* Lifecycles.rerenderRoot(afterEvent);

      yield* flushHooks(rerendered);

      const finalRender = yield* Lifecycles.rerenderRoot(rerendered);
      const encoded     = RouteCodec.encodeMessage(root, route.dokens);

      return yield* E.fork(InteractionDOM.reply(
        rest.application_id,
        route.dokens.defer ?? route.dokens.fresh,
        encoded,
      ).pipe(localMutex));
    }

    Globals.dismountRoot(root.pointer);

    const nextClone = yield* OldRoot.makeClone(
      root.id,
      root.fiber.next.id,
      root.fiber.next.props,
    );

    Globals.mountRoot(nextClone.pointer, nextClone.fiber);

    const rendered = yield* Lifecycles.rerenderRoot(nextClone.element);

    if ((rendered as FunctionElement.TaskElement).meta.isModal) {
      yield* new BadInteraction({
        why: 'Unsupported interaction: modal open',
      });

      route.dokens.fresh.type = Rest.Tx.MODAL;
      // const encoded = yield* encodeDialogInteraction(rendered, frame.restDoken);
      return yield* E.fork(InteractionDOM.create(route.dokens.fresh, {} as any).pipe(localMutex));
    }


    if (afterEvent.meta.isEphemeral !== (rendered as FunctionElement.TaskElement).meta.isEphemeral) {
      route.dokens.fresh.type      = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
      route.dokens.fresh.ephemeral = 1;
      route.dokens.fresh           = Doken.makeDeferred(route.dokens.fresh);

      yield* E.fork(DokenCache.save(route.dokens.fresh));
      yield* E.fork(InteractionDOM.defer(route.dokens.fresh).pipe(localMutex));
    }
    else if (route.dokens.defer) {
      yield* E.fork(InteractionDOM.discard(route.dokens.fresh));
    }
    else {
      route.dokens.fresh.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      route.dokens.fresh      = Doken.makeDeferred(route.dokens.fresh);

      yield* E.fork(DokenCache.save(route.dokens.fresh));
      yield* E.fork(InteractionDOM.defer(route.dokens.fresh).pipe(localMutex));
    }


    yield* flushHooks(rendered);

    const finalRender = yield* Lifecycles.rerenderRoot(rendered);
    const encoded     = RouteCodec.encodeMessage(nextClone, route.dokens);

    return yield* E.fork(InteractionDOM.reply(
      rest.application_id,
      route.dokens.defer ?? route.dokens.fresh,
      encoded,
    ).pipe(localMutex));
  },
  E.provide(InteractionBroker.makeLayer()),
);


export const flushHooks = (root: Element.Element) => E.gen(function* () {
  const states = Lifecycles.collectStates(root);

  for (const id in states) {
    for (const effect of states[id].queue) {
      if (effect.constructor.name === 'AsyncFunction') {
        yield* E.tryPromise(async () => await effect());
      }
      else if (E.isEffect(effect)) {
        yield* effect as E.Effect<void>;
      }
      else {
        yield* E.try(() => effect());
      }
    }
  }

  return root;
});
