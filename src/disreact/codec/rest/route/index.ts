import * as Component from '#src/disreact/codec/rest/route/component.ts';
import * as Dialog from '#src/disreact/codec/rest/route/dialog.ts';
import * as Message from '#src/disreact/codec/rest/route/message.ts';
import {S} from '#src/internal/pure/effect.ts';
export * as Component from '#src/disreact/codec/rest/route/component.ts';
export * as Dialog from '#src/disreact/codec/rest/route/dialog.ts';
export * as Message from '#src/disreact/codec/rest/route/message.ts';



export const T = S.Union(
  Message.T,
  Component.T,
  Dialog.T,
);

export type T = S.Schema.Type<typeof T>;

export const isMessage   = Message.is;
export const isComponent = Component.is;
export const isDialog    = Dialog.is;

export const isMessagePrefix   = Message.isPrefix;
export const isComponentPrefix = Component.isPrefix;
export const isDialogPrefix    = Dialog.isPrefix;
