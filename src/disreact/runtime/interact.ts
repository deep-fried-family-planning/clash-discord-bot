import * as All from '#src/disreact/codec/constants/all.ts';
import {BadInteraction} from '#src/disreact/codec/error.ts';
import {CLOSE, Doken, NONE_STR, Rest} from '#src/disreact/codec/rest/index.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';
import {StaticGraph} from '#src/disreact/model/StaticGraph.ts';
import {DiscordDOM} from '#src/disreact/runtime/service/DiscordDOM.ts';
import {DokenMemory} from '#src/disreact/runtime/service/DokenMemory.ts';
import {InteractionBroker} from '#src/disreact/runtime/service/InteractionBroker.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Codec} from '../codec';
import type {FunctionElement} from '../codec/entities/index.ts';



export const interact = E.fn(
  function* (rest: Rest.Ix) {
    const frame = yield* Codec.decodeInteraction(rest);

    Globals.setPointer(frame.pointer);
    Globals.mountRoot(frame.pointer, frame.state);

    const root = yield* StaticGraph.cloneRoot(frame.params.root);

    switch (frame.event.kind) {
    case All.ButtonEventTag:
    case All.SelectEventTag:
    case All.UserSelectEventTag:
    case All.RoleSelectEventTag:
    case All.ChannelSelectEventTag:
    case All.MentionSelectEventTag:
      return yield* processClick(frame, root);

    case All.SubmitEventTag:
      return yield* processSubmit(frame, root);
    }

    return yield* new BadInteraction({why: 'unsupported interaction'});
  },
  E.provide(InteractionBroker.makeLayer()),
);



const processClick = E.fn(function* (frame: Codec.Frame, root: Pragma) {
  const hydrated = yield* Lifecycles.hydrateRoot(root, frame.state.fibers);

  yield* flushHooks(hydrated);

  const afterEvent = Lifecycles.invokeIntrinsicTarget(hydrated, frame.event) as any;
  frame.state      = Globals.readRoot(frame.pointer);



  const localMutex = yield* InteractionBroker.mutex();

  if (frame.state.graph.next === CLOSE) {
    if (frame.dokens.rest) {
      yield* E.fork(DiscordDOM.discard(frame.dokens.fresh));
      yield* E.fork(DokenMemory.free(frame.dokens.rest.id));
      return yield* E.fork(DiscordDOM.dismount(
        frame.rest.application_id,
        frame.dokens.rest,
      ));
    }

    yield* E.fork(DiscordDOM.discard(frame.dokens.fresh).pipe(localMutex));
    return yield* E.fork(DiscordDOM.dismount(
      frame.rest.application_id,
      frame.dokens.fresh,
    ).pipe(localMutex));
  }



  if (
    frame.state.graph.next === NONE_STR
    || frame.state.graph.next === frame.params.root
  ) {
    frame.state.graph.next = frame.params.root;

    if (frame.dokens.rest) {
      yield* E.fork(DiscordDOM.discard(frame.dokens.fresh));
    }
    else {
      frame.dokens.fresh.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      frame.dokens.fresh      = yield* Doken.activate({doken: frame.dokens.fresh});

      yield* E.fork(DokenMemory.save(frame.dokens.fresh));
      yield* E.fork(DiscordDOM.defer(frame.dokens.fresh).pipe(localMutex));
    }

    const rerendered = yield* Lifecycles.rerenderRoot(afterEvent);

    yield* flushHooks(rerendered);

    const finalRender = yield* Lifecycles.rerenderRoot(rerendered);
    const encoded     = Codec.encodeMessage(frame, finalRender);

    return yield* E.fork(DiscordDOM.reply(
      frame.rest.application_id,
      frame.dokens.rest ?? frame.dokens.fresh,
      encoded,
    ).pipe(localMutex));
  }


  const nextClone = yield* StaticGraph.cloneRoot(frame.state.graph.next);
  const rendered  = yield* Lifecycles.rerenderRoot(nextClone);


  if ((rendered as FunctionElement.Type).meta.isModal) {
    yield* new BadInteraction({
      why: 'Unsupported interaction: modal open',
    });

    frame.dokens.fresh.type = Rest.Tx.MODAL;
    // const encoded = yield* encodeDialogInteraction(rendered, frame.restDoken);
    return yield* E.fork(DiscordDOM.create(frame.dokens.fresh, {} as any).pipe(localMutex));
  }


  if (afterEvent.meta.isEphemeral !== (rendered as FunctionElement.Type).meta.isEphemeral) {
    frame.dokens.fresh.type      = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
    frame.dokens.fresh.ephemeral = 1;
    frame.dokens.fresh           = yield* Doken.activate({doken: frame.dokens.fresh});

    yield* E.fork(DokenMemory.save(frame.dokens.fresh));
    yield* E.fork(DiscordDOM.defer(frame.dokens.fresh).pipe(localMutex));
  }
  else if (frame.dokens.rest) {
    yield* E.fork(DiscordDOM.discard(frame.dokens.fresh));
  }
  else {
    frame.dokens.fresh.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
    frame.dokens.fresh      = yield* Doken.activate({doken: frame.dokens.fresh});

    yield* E.fork(DokenMemory.save(frame.dokens.fresh));
    yield* E.fork(DiscordDOM.defer(frame.dokens.fresh).pipe(localMutex));
  }


  yield* flushHooks(rendered);

  const finalRender = yield* Lifecycles.rerenderRoot(rendered);
  const encoded     = Codec.encodeMessage(frame, finalRender);

  return yield* E.fork(DiscordDOM.reply(
    frame.rest.application_id,
    frame.dokens.rest ?? frame.dokens.fresh,
    encoded,
  ).pipe(localMutex));
});



const processSubmit = E.fn(
  function* (frame: Codec.Frame, root: Pragma) {

  },
);



export const flushHooks = (root: Pragma) => E.gen(function* () {
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
