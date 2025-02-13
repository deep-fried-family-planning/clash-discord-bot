/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import {CLOSE, Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {makeDeferred} from '#src/disreact/internal/codec/doken-codec.ts';
import {encodeDialogInteraction, encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import {collectStates, dispatchEvent, hydrateRoot, type Pragma, rerenderRoot} from '#src/disreact/internal/index.ts';
import {StaticGraph} from '#src/disreact/internal/model/StaticGraph.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {closeEvent, isSameRoot} from '#src/disreact/runtime/flows/utils.ts';
import {E} from '#src/internal/pure/effect.ts';



export const clickEvent = E.gen(function * () {
  const frame = yield * DisReactFrame.read();
  HookDispatch.__acquire(frame.pointer);
  HookDispatch.__ctxwrite(frame.context);

  const clone = yield * StaticGraph.cloneRoot(frame.rx.params.root);
  const hydrated = hydrateRoot(clone, frame.rx.states);
  yield * flushHooks(hydrated);

  const afterEvent = dispatchEvent(hydrated, frame.event);
  frame.context = HookDispatch.__ctxread();

  if (frame.context.next === CLOSE) {
    return yield * closeEvent;
  }
  if (isSameRoot(frame)) {
    if (frame.doken) {
      yield * DiscordDOM.acknowledge(frame.restDoken);
    }
    else {
      frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      frame.doken = makeDeferred(frame.restDoken);
      yield * DiscordDOM.defer(frame.restDoken);
      yield * DokenMemory.save(frame.doken);
    }

    const rerendered = rerenderRoot(afterEvent);
    yield * flushHooks(rerendered);
    const finalRender = rerenderRoot(rerendered);

    const encoded = encodeMessageInteraction(finalRender, frame.doken);

    yield * DiscordDOM.reply(frame.doken, encoded);
    return;
  }
  else {
    const nextClone = yield * StaticGraph.cloneRoot(frame.context.next);
    const rendered = rerenderRoot(nextClone);


    if (rendered.isModal) {
      frame.restDoken.type = Rest.Tx.MODAL;

      if (frame.doken) {
        const encoded = yield * encodeDialogInteraction(rendered, frame.doken);
        return yield * DiscordDOM.create(frame.restDoken, encoded);
      }
      const encoded = yield * encodeDialogInteraction(rendered, frame.restDoken);
      return yield * DiscordDOM.create(frame.restDoken, encoded);
    }


    if (afterEvent.isEphemeral !== rendered.isEphemeral) {
      frame.restDoken.type = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
      frame.restDoken.flags = 64;
      frame.doken = makeDeferred(frame.restDoken);
      yield * DiscordDOM.defer(frame.restDoken);
      yield * E.logInfo(frame.doken);
      yield * DokenMemory.save(frame.doken);
    }
    else if (frame.doken) {
      yield * DiscordDOM.acknowledge(frame.restDoken);
    }
    else {
      frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      frame.doken = makeDeferred(frame.restDoken);
      yield * DiscordDOM.defer(frame.restDoken);
      yield * E.logInfo(frame.doken);
      yield * DokenMemory.save(frame.doken);
    }

    yield * flushHooks(rendered);
    const finalRender = rerenderRoot(rendered);
    const encoded = encodeMessageInteraction(finalRender, frame.doken);

    yield * DiscordDOM.reply(frame.doken, encoded);
  }
});



export const flushHooks = (root: Pragma) => E.gen(function * () {
  const states = collectStates(root);

  for (const id in states) {
    for (const effect of states[id].async) {
      if (effect.constructor.name === 'AsyncFunction') {
        yield * E.tryPromise(async () => await effect());
      }
      else if (E.isEffect(effect)) {
        yield * effect as E.Effect<void>;
      }
      else {
        yield * E.try(() => effect());
      }
    }
  }

  return root;
});
