import {CLOSE, Rest} from '#src/disreact/codec/abstract/index.ts';
import {makeDeferred} from '#src/disreact/codec/doken-codec.ts';
import {encodeDialogInteraction, encodeMessageInteraction} from '#src/disreact/codec/interaction-codec.ts';
import {collectStates, dispatchEvent, hydrateRoot, type Pragma, rerenderRoot} from '#src/disreact/dsx/lifecycle.ts';
import {HookDispatch} from '#src/disreact/hooks/HookDispatch.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {StaticGraph} from '#src/disreact/lifecycle/StaticGraph.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {closeEvent, isSameRoot} from '#src/disreact/runtime/flows/utils.ts';
import {E} from '#src/internal/pure/effect.ts';



export const clickEvent = E.gen(function * () {
  const frame = yield * DisReactFrame.read();
  HookDispatch.__acquire(frame.pointer);
  HookDispatch.__ctxwrite(frame.context);

  const clone = yield * StaticGraph.cloneRoot(frame.rx.params.root);
  const hydrated = yield * hydrateRoot(clone, frame.rx.states);
  yield * flushHooks(hydrated);

  const afterEvent = dispatchEvent(hydrated, frame.event);
  frame.context = HookDispatch.__ctxread();

  yield * flushContext;

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

    const rerendered = yield * rerenderRoot(afterEvent);
    yield * flushHooks(rerendered);
    const finalRender = yield * rerenderRoot(rerendered);

    const encoded = encodeMessageInteraction(finalRender, frame.doken);

    yield * DiscordDOM.reply(frame.doken, encoded);
    return;
  }
  else {
    const nextClone = yield * StaticGraph.cloneRoot(frame.context.next);
    const rendered = yield * rerenderRoot(nextClone);


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
    const finalRender = yield * rerenderRoot(rendered);
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



export const flushContext = E.gen(function * () {
  const ctx = HookDispatch.__ctxread();

  if (!ctx.store || !ctx.store.queue.length) {
    return;
  }
  const state = ctx.store.stack.pop()!;

  while (ctx.store.queue.length) {
    const action = ctx.store.queue.shift()!;

    const next = ctx.store.reducer(state, action);
    let nextState: any;

    if (E.isEffect(next)) {
      nextState = yield * (next as E.Effect<void>);
    }
    else if (next.constructor.name === 'AsyncFunction') {
      nextState = yield * E.tryPromise(async () => await next());
    }
    else {
      nextState = next;
    }
    ctx.store.stack.push(nextState);
  }
});
