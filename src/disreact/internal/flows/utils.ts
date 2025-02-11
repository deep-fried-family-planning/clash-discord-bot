import {CLOSE, Doken, NONE_STR} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {IxContext, type IxCtx} from '#src/disreact/internal/layer/IxContext.ts';
import {E} from '#src/internal/pure/effect.ts';



export const closeEvent = E.gen(function * () {
  const ix = yield * IxContext.read();

  if (ix.doken) {
    const doken = Doken.validateTTL(ix.doken);

    if (doken) {
      yield * E.forkAll([
        DiscordDOM.dismount(doken),
        DokenMemory.free(doken.id),
      ]);
      return;
    }
  }

  yield * DiscordDOM.acknowledge(ix.restDoken);
  yield * E.fork(DiscordDOM.dismount(ix.restDoken));
});


export const isClose    = (ix: IxCtx) => ix.context.next === CLOSE;
export const isSameRoot = (ix: IxCtx) => ix.context.next === NONE_STR || ix.context.next === ix.rx.params.root;
export const isClick    = (ix: IxCtx) => ix.event.type === 'onclick';
export const isSubmit   = (ix: IxCtx) => ix.event.type === 'onsubmit';



export const getTxType = () => {};
