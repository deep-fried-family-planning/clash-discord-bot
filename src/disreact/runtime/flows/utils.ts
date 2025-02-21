// import type { Codec } from '#src/disreact/codec';
// import {CLOSE, NONE_STR} from '#src/disreact/codec/rest/index.ts';
// import {DisReactFrame, type IxCtx} from '#src/disreact/runtime/DisReactFrame.ts';
// import {DiscordDOM, DokenMemory} from '#src/disreact/service.ts';
// import {E} from '#src/internal/pure/effect.ts';
//
//
//
// export const closeEvent = E.fn(function* (frame: Codec.Frame) {
//   const localMutex = yield * DisReactFrame.mutex();
//
//   if (frame.dokens.rest) {
//     yield* E.fork(DokenMemory.free(ix.doken.id));
//     yield* E.fork(DiscordDOM.discard(ix.restDoken));
//     yield* E.fork(DiscordDOM.dismount(ix.doken));
//   }
//   else {
//     yield* DiscordDOM.discard(ix.restDoken);
//     yield* E.fork(DiscordDOM.dismount(ix.restDoken));
//   }
// });
//
//
// export const isClose    = (ix: IxCtx) => ix.context.graph.next === CLOSE;
// export const isSameRoot = (ix: IxCtx) => ix.context.graph.next === NONE_STR || ix.context.graph.next === ix.rx.params.root;
// export const isClick    = (ix: IxCtx) => ix.event.type === 'onclick';
// export const isSubmit   = (ix: IxCtx) => ix.event.type === 'onsubmit';
//
//
//
// export const getTxType = () => {};
