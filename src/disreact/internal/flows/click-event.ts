import {Rest} from '#src/disreact/abstract/index.ts';
import {DiscordDOM} from '#src/disreact/interface/service.ts';
import {makeDeferred} from '#src/disreact/internal/codec/doken-codec.ts';
import {encodeMessageInteraction} from '#src/disreact/internal/codec/interaction-codec.ts';
import {closeEvent, isClose, isSameRoot} from '#src/disreact/internal/flows/utils.ts';
import {__acquire, __ctxread, __ctxwrite, Critical, dispatchEvent, hydrateRoot, rerenderRoot} from '#src/disreact/internal/index.ts';
import {IxContext} from '#src/disreact/internal/layer/IxContext.ts';
import {StaticDOM} from '#src/disreact/internal/layer/StaticDOM.ts';
import {E} from '#src/internal/pure/effect.ts';



export const clickEvent = E.gen(function * () {
  const ix    = yield * IxContext.read();
  __acquire(ix.pointer);
  __ctxwrite(ix.context);


  const mutex = yield * IxContext.mutex();

  const clone    = yield * StaticDOM.checkoutRoot(ix.rx.params.root);
  const hydrated = hydrateRoot(clone, ix.rx.states);  // todo run mount effects


  const afterEvent = dispatchEvent(hydrated, ix.event); // todo run after effects
  ix.context       = __ctxread();



  if (isClose(ix)) {
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
    }

    const rerendered = rerenderRoot(afterEvent); // todo run effects

    const encoded = encodeMessageInteraction(rerendered, ix.doken);

    yield * DiscordDOM.reply(ix.doken, encoded);
    return;
  }



  const nextClone = yield * StaticDOM.checkoutRoot(ix.context.next);
  const rendered  = rerenderRoot(nextClone); // todo run after effects

  if (rendered.isModal) {
    return yield * new Critical({why: 'unimplemented'});
  }

  // todo optimize dokens

  ix.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
  ix.doken          = makeDeferred(ix.restDoken);
  yield * DiscordDOM.defer(ix.restDoken);

  const encoded = encodeMessageInteraction(rendered, ix.doken);

  yield * DiscordDOM.reply(ix.doken, encoded);
});
