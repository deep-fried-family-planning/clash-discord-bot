import {Rest} from '#src/disreact/codec/abstract/index.ts';
import {Critical} from '#src/disreact/codec/debug.ts';
import {dispatchEvent, hydrateRoot, rerenderRoot} from '#src/disreact/dsx/lifecycle.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {makeDeferred} from '#src/disreact/codec/doken-codec.ts';
import {encodeMessageInteraction} from '#src/disreact/codec/interaction-codec.ts';
import {HookDispatch} from '#src/disreact/hooks/HookDispatch.ts';
import {StaticGraph} from '#src/disreact/lifecycle/StaticGraph.ts';
import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
import {flushHooks} from '#src/disreact/runtime/flows/click-event.ts';
import {isSameRoot} from '#src/disreact/runtime/flows/utils.ts';
import {E} from '#src/internal/pure/effect.ts';



export const submitEvent = E.gen(function * () {
  const frame = yield * DisReactFrame.read();
  HookDispatch.__acquire(frame.pointer);
  HookDispatch.__ctxwrite(frame.context);

  const cloneDialog = yield * StaticGraph.cloneRoot(frame.rx.params.root);
  const hydratedDialog = hydrateRoot(cloneDialog, {});

  console.log('hydratedDialog', hydratedDialog);

  dispatchEvent(hydratedDialog, frame.event);

  frame.context = HookDispatch.__ctxread();


  if (isSameRoot(frame)) {
    return yield * new Critical({
      why: 'dialog components must call page.next',
    });
  }

  const nextClone = yield * StaticGraph.cloneRoot(frame.context.next);

  if (nextClone.isModal) {
    return yield * new Critical({
      why: 'page.next cannot be called with a dialog from a dialog',
    });
  }

  if (frame.doken) {
    yield * DiscordDOM.acknowledge(frame.restDoken);
  }
  else {
    frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
    frame.doken = makeDeferred(frame.restDoken);
    yield * DiscordDOM.defer(frame.restDoken);
    yield * DokenMemory.save(frame.doken);
  }

  const nextRender = rerenderRoot(nextClone);

  yield * flushHooks(nextRender);

  const finalRender = rerenderRoot(nextRender);
  const encoded = encodeMessageInteraction(finalRender, frame.doken);

  yield * DiscordDOM.reply(frame.doken, encoded);
});
