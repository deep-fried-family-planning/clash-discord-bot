/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import {CLOSE, Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {makeDeferred} from '#src/disreact/internal/codec/doken-codec.ts';
import {encodeDialogInteraction, encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import {collectStates, dispatchEvent, hydrateRoot, type Pragma, rerenderRoot} from '#src/disreact/internal/index.ts';
import {StaticGraph} from '#src/disreact/internal/model/StaticGraph.ts';
import {DisReactFrame} from '#src/disreact/internal/runtime/DisReactFrame.ts';
import {closeEvent, isSameRoot} from '#src/disreact/internal/runtime/flows/utils.ts';
import {E} from '#src/internal/pure/effect.ts';



export const clickEvent = E.gen(function * () {
  const ix = yield * DisReactFrame.read();
  HookDispatch.__acquire(ix.pointer);
  HookDispatch.__ctxwrite(ix.context);

  const clone    = yield * StaticGraph.cloneRoot(ix.rx.params.root);
  const hydrated = hydrateRoot(clone, ix.rx.states);
  yield * flushHooks(hydrated);

  const afterEvent = dispatchEvent(hydrated, ix.event);
  ix.context       = HookDispatch.__ctxread();

  if (ix.context.next === CLOSE) {
    return yield * closeEvent;
  }
  if (isSameRoot(ix)) {
    if (ix.doken) {
      yield * DiscordDOM.acknowledge(ix.restDoken);
    }
    else {
      ix.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      ix.doken          = makeDeferred(ix.restDoken);
      yield * DiscordDOM.defer(ix.restDoken);
      yield * DokenMemory.save(ix.doken);
    }

    const rerendered = rerenderRoot(afterEvent);
    yield * flushHooks(rerendered);
    const finalRender = rerenderRoot(rerendered);

    const encoded = encodeMessageInteraction(finalRender, ix.doken);

    yield * DiscordDOM.reply(ix.doken, encoded);
    return;
  }
  else {
    const nextClone = yield * StaticGraph.cloneRoot(ix.context.next);
    const rendered  = rerenderRoot(nextClone);


    if (rendered.isModal) {
      ix.restDoken.type = Rest.Tx.MODAL;

      if (ix.doken) {
        const encoded = yield * encodeDialogInteraction(rendered, ix.doken);
        yield * DiscordDOM.create(ix.restDoken, encoded);
        return;
      }
      const encoded = yield * encodeDialogInteraction(rendered, ix.restDoken);
      yield * DiscordDOM.create(ix.restDoken, encoded);
      return;
    }


    if (afterEvent.isEphemeral !== rendered.isEphemeral) {
      ix.restDoken.type  = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
      ix.restDoken.flags = 64;
      ix.doken           = makeDeferred(ix.restDoken);
      yield * DiscordDOM.defer(ix.restDoken);
      yield * E.logInfo(ix.doken);
      yield * DokenMemory.save(ix.doken);
    }
    else if (ix.doken) {
      yield * DiscordDOM.acknowledge(ix.restDoken);
    }
    else {
      ix.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
      ix.doken          = makeDeferred(ix.restDoken);
      yield * DiscordDOM.defer(ix.restDoken);
      yield * E.logInfo(ix.doken);
      yield * DokenMemory.save(ix.doken);
    }

    yield * flushHooks(rendered);
    const finalRender = rerenderRoot(rendered);
    const encoded     = encodeMessageInteraction(finalRender, ix.doken); // todo run after effects

    yield * DiscordDOM.reply(ix.doken, encoded);
  }
});



const flushHooks = (root: Pragma) => E.gen(function * () {
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
