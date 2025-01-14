import {g, pipe} from '#pure/effect';
import {Cd, Ed, Ix, VDialog, VEvent, VMessage} from '#src/internal/disreact/entity/index.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';


export type T = {
  message: VMessage.T;
  dialog : VDialog.T;
};


export const makeEmpty = (): T => ({
  message: VMessage.makeEmpty(),
  dialog : VDialog.makeEmpty(),
});


export const attachElement = (
  rendered: VMessage.T | VDialog.T,
) => (
  document: T,
) => {
  if (rendered._tag === 'Message') {
    document.message = rendered;
  }
  else {
    document.dialog = rendered;
  }
  return document;
};


export const makeFromRest = g(function * () {
  const rest   = yield * RouteManager.rest();
  const params = yield * RouteManager.getParams();
  const dialog = yield * VDialog.makeFromRest;

  if (Ix.isRestSubmit(rest, rest.data)) {
    const message = yield * MemoryStore.loadDialogMessage(params.prev_id);

    return pipe(
      makeEmpty(),
      attachElement(dialog),
      attachElement(VMessage.make(
        Ed.decodeGrid(message.embeds),
        Cd.decodeGrid(message.components),
      )),
    );
  }

  const message = yield * VMessage.makeFromRest;

  return pipe(
    makeEmpty(),
    attachElement(dialog),
    attachElement(message),
  );
});


const voidHandler = () => {
};


export const getEventHandler = (event: VEvent.VEvent) => (self: T) => {
  if (VEvent.isNone(event)) {
    return voidHandler;
  }
  if (VEvent.isTyped(event)) {
    return self.dialog.components[event.row][event.col].onClick;
  }
  if (VEvent.isOpened(event)) {
    return self.dialog.onOpen;
  }
  if (VEvent.isSubmitted(event)) {
    return self.dialog.onSubmit;
  }
  return self.message.components[event.row][event.col].onClick;
};


export const getEventTarget = (event: VEvent.VEvent) => (self: T) => {
  if (VEvent.isNone(event)) {
    return null;
  }
  if (VEvent.isTyped(event)) {
    return self.dialog.components[event.row][event.col].data;
  }
  if (VEvent.isClicked(event)) {
    return self.message.components[event.row][event.col].data;
  }
  return null;
};
