// import {Doken, Rest} from '#src/disreact/codec/rest/index.ts';
// import {BadInteraction} from '#src/disreact/codec/entities/error.ts';
// import {dispatchEvent, hydrateRoot, rerenderRoot} from '#src/disreact/model/lifecycle.ts';
// import {StaticGraph} from '#src/disreact/model/globals/StaticGraph.ts';
// import {DisReactFrame} from '#src/disreact/runtime/DisReactFrame.ts';
// import {flushHooks} from '#src/disreact/runtime/flows/click-event.ts';
// import {isSameRoot} from '#src/disreact/runtime/flows/utils.ts';
// import {DiscordDOM, DokenMemory} from '#src/disreact/service.ts';
// import {E} from '#src/internal/pure/effect.ts';
// import type {FunctionElement} from 'src/disreact/codec/entities';
// import * as Globals from '#src/disreact/model/globals/globals.ts';
//
//
//
// export const submitEvent = E.gen(function* () {
//   const frame = yield* DisReactFrame.read();
//   Globals.setPointer(frame.pointer);
//   Globals.mountRoot(frame.pointer, frame.context);
//
//   const cloneDialog    = yield* StaticGraph.cloneRoot(frame.rx.params.root);
//   const hydratedDialog = yield* hydrateRoot(cloneDialog, {});
//
//   dispatchEvent(hydratedDialog, frame.event);
//
//   frame.context = Globals.readRoot(frame.pointer);
//
//
//   if (isSameRoot(frame)) {
//     return yield* new BadInteraction({
//       why: 'dialog components must call page.next',
//     });
//   }
//
//   const nextClone = yield* StaticGraph.cloneRoot(frame.context.graph.next);
//
//   if ((nextClone as FunctionElement.Type).meta.isModal) {
//     return yield* new BadInteraction({
//       why: 'page.next cannot be called with a dialog from a dialog',
//     });
//   }
//
//   if (frame.doken) {
//     yield* E.fork(DiscordDOM.discard(frame.restDoken));
//   }
//   else {
//     frame.restDoken.type = Rest.Tx.DEFERRED_UPDATE_MESSAGE;
//     frame.doken          = yield* Doken.activate({doken: frame.restDoken});
//     yield* DiscordDOM.defer(frame.restDoken);
//     yield* DokenMemory.save(frame.doken);
//   }
//
//   const nextRender = yield* rerenderRoot(nextClone);
//
//   yield* flushHooks(nextRender);
//
//   const finalRender = yield* rerenderRoot(nextRender);
//   // const encoded     = encodeMessageInteraction(finalRender, frame.doken);
//
//   yield* DiscordDOM.reply(frame.doken, {} as any);
// });
