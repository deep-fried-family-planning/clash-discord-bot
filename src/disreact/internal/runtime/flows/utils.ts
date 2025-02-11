import {CLOSE, Doken, NONE_STR} from '#src/disreact/abstract/index.ts';
import {DiscordDOM, DokenMemory} from '#src/disreact/interface/service.ts';
import {IxScope, type IxCtx} from '#src/disreact/internal/runtime/IxScope.ts';
import {E} from '#src/internal/pure/effect.ts';
import console from 'node:console';



export const closeEvent = E.gen(function * () {
  const ix = yield * IxScope.read();

  if (ix.doken) {
    console.log('ix.doken', ix.doken);
    yield * DiscordDOM.acknowledge(ix.restDoken);
    yield * DiscordDOM.dismount(ix.doken);
    yield * DokenMemory.free(ix.doken.id);
    return;
  }

  yield * DiscordDOM.acknowledge(ix.restDoken);
  yield * DiscordDOM.dismount(ix.restDoken);
});


export const isClose    = (ix: IxCtx) => ix.context.next === CLOSE;
export const isSameRoot = (ix: IxCtx) => ix.context.next === NONE_STR || ix.context.next === ix.rx.params.root;
export const isClick    = (ix: IxCtx) => ix.event.type === 'onclick';
export const isSubmit   = (ix: IxCtx) => ix.event.type === 'onsubmit';



export const getTxType = () => {};
