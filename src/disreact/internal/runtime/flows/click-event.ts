/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import {CLOSE, Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {makeDeferred} from '#src/disreact/internal/codec/doken-codec.ts';
import {encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import {StaticGraph} from '#src/disreact/internal/model/StaticGraph.ts';
import {collectStates, Critical, dispatchEvent, hydrateRoot, type Pragma, rerenderRoot} from '#src/disreact/internal/index.ts';
import {closeEvent, isSameRoot} from '#src/disreact/internal/runtime/flows/utils.ts';
import {IxScope} from '#src/disreact/internal/runtime/IxScope.ts';
import {E} from '#src/internal/pure/effect.ts';
import console from 'node:console';
import {inspect} from 'node:util';



export const clickEvent = E.gen(function * () {
  const ix = yield * IxScope.read();
  HookDispatch.__acquire(ix.pointer);
  HookDispatch.__ctxwrite(ix.context);

  const clone = yield * StaticGraph.cloneRoot(ix.rx.params.root);

  console.log('ix.rx.states', inspect(ix.rx.states, false, null));
  const hydrated = hydrateRoot(clone, ix.rx.states);  // todo run mount effects

  yield * flushHooks(hydrated);

  const afterEvent = dispatchEvent(hydrated, ix.event); // todo run after effects
  ix.context       = HookDispatch.__ctxread();

  console.log('ix.context', ix.context);
  yield * E.logFatal('ix.context', ix.context);
  yield * E.logFatal('DOES THIS WORK???', ix.context);

  if (ix.context.next === CLOSE) {
    console.log('close event');
    yield * E.logInfo('close event');
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

    const rerendered = rerenderRoot(afterEvent); // todo run effects

    yield * flushHooks(afterEvent);

    const encoded = encodeMessageInteraction(rerendered, ix.doken);

    yield * DiscordDOM.reply(ix.doken, encoded);
    return;
  }

  const nextClone = yield * StaticGraph.cloneRoot(ix.context.next);
  const rendered  = rerenderRoot(nextClone); // todo run after effects


  yield * flushHooks(rendered);


  if (rendered.isModal) {
    return yield * new Critical({why: 'unimplemented'});
  }

  if (afterEvent.isEphemeral !== rendered.isEphemeral) {
    ix.restDoken.type  = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
    ix.restDoken.flags = 64;
    ix.doken           = makeDeferred(ix.restDoken);
    yield * DiscordDOM.defer(ix.restDoken);
    yield * DokenMemory.save(ix.doken);
  }
  else if (ix.doken) {
    yield * DiscordDOM.acknowledge(ix.restDoken);
  }
  else {
    ix.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
    ix.doken          = makeDeferred(ix.restDoken);
    yield * DiscordDOM.defer(ix.restDoken);
    yield * DokenMemory.save(ix.doken);
  }

  const finalRender = rerenderRoot(rendered);
  const encoded     = encodeMessageInteraction(finalRender, ix.doken); // todo run after effects

  yield * DiscordDOM.reply(ix.doken, encoded);
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
