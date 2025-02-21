// import {CLOSE, Doken, Rest} from '#src/disreact/codec/rest/index.ts';
// import {collectStates, dispatchEvent, hydrateRoot, type Pragma, rerenderRoot} from '#src/disreact/model/lifecycle.ts';
// import {StaticGraph} from '#src/disreact/model/globals/StaticGraph.ts';
// import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
// import {closeEvent, isSameRoot} from '#src/disreact/runtime/flows/utils.ts';
// import {DiscordDOM, DokenMemory} from '#src/disreact/service.ts';
// import {E} from '#src/internal/pure/effect.ts';
// import type {FunctionElement} from 'src/disreact/codec/entities';
// import * as Globals from '#src/disreact/model/globals/globals.ts';
//
//
//
// export const clickEvent = E.gen(function* () {
//   const frame = yield* DisReactFrame.read();
//   Globals.setPointer(frame.pointer);
//   Globals.mountRoot(frame.pointer, frame.context);
//
//   const clone    = yield* StaticGraph.cloneRoot(frame.rx.params.root);
//   const hydrated = yield* hydrateRoot(clone, frame.rx.states);
//   yield* flushHooks(hydrated);
//
//   const afterEvent: FunctionElement.Type = dispatchEvent(hydrated, frame.event) as any;
//   frame.context                          = Globals.readRoot(frame.pointer);
//
//
//   if (frame.context.graph.next === CLOSE) {
//     return yield* closeEvent;
//   }
//   if (isSameRoot(frame)) {
//     if (frame.doken) {
//       yield* E.fork(DiscordDOM.discard(frame.restDoken));
//     }
//     else {
//       frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
//       frame.doken          = yield* Doken.activate({doken: frame.restDoken});
//       yield* DiscordDOM.defer(frame.restDoken);
//       yield* DokenMemory.save(frame.doken);
//     }
//
//     const rerendered = yield* rerenderRoot(afterEvent);
//     yield* flushHooks(rerendered);
//     const finalRender = yield* rerenderRoot(rerendered);
//
//     // const encoded = encodeMessageInteraction(finalRender, frame.doken);
//
//     yield* DiscordDOM.reply(frame.doken, {} as any);
//     return;
//   }
//   else {
//     const nextClone = yield* StaticGraph.cloneRoot(frame.context.graph.next);
//     const rendered  = yield* rerenderRoot(nextClone);
//
//
//     if ((rendered as FunctionElement.Type).meta.isModal) {
//       frame.restDoken.type = Rest.Tx.MODAL;
//
//       if (frame.doken) {
//         // const encoded = yield* encodeDialogInteraction(rendered, frame.doken);
//         return yield* DiscordDOM.create(frame.restDoken, {} as any);
//       }
//       // const encoded = yield* encodeDialogInteraction(rendered, frame.restDoken);
//       return yield* DiscordDOM.create(frame.restDoken, {} as any);
//     }
//
//
//     if (afterEvent.meta.isEphemeral !== (rendered as FunctionElement.Type).meta.isEphemeral) {
//       frame.restDoken.type      = Rest.Tx.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE;
//       frame.restDoken.ephemeral = 1;
//       frame.doken               = yield* Doken.activate({doken: frame.restDoken});
//       yield* DiscordDOM.defer(frame.restDoken);
//       yield* E.logInfo(frame.doken);
//       yield* DokenMemory.save(frame.doken);
//     }
//     else if (frame.doken) {
//       yield* E.fork(DiscordDOM.discard(frame.restDoken));
//     }
//     else {
//       frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
//       frame.doken          = yield* Doken.activate({doken: frame.restDoken});
//       yield* DiscordDOM.defer(frame.restDoken);
//       yield* E.logInfo(frame.doken);
//       yield* DokenMemory.save(frame.doken);
//     }
//
//     yield* flushHooks(rendered);
//     const finalRender = yield* rerenderRoot(rendered);
//     // const encoded     = encodeMessageInteraction(finalRender, frame.doken);
//
//     yield* DiscordDOM.reply(frame.doken, {} as any);
//   }
// });
//
//
//
