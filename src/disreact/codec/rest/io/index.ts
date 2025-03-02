import {S} from '#src/internal/pure/effect.ts';
import * as Dialog from './dialog.ts';
import * as Message from './message.ts';
import * as Command from './command.ts';
export * as Dialog from './dialog.ts';
export * as Message from './message.ts';
export * as Command from './command.ts';



export const I = S.Union(
  Dialog.I,
  Message.I,
  Command.I,
);

export type I = S.Schema.Type<typeof I>;

export const O = S.Union(
  Dialog.O,
  Message.O,
  Command.O,
);

export type O = S.Schema.Type<typeof O>;

export const isCommand = Command.is;
export const isDialog = Dialog.is;
export const isMessage = Message.is;
