export * as Component from './component-route.ts';
export * as Dialog from './dialog-route.ts';
export * as Message from './message-route.ts';
import * as Message from './message-route.ts';
import * as Component from './component-route.ts';
import * as Dialog from './dialog-route.ts';
import { Union } from 'effect/Schema';



export const Type = Union(
  Message.Type,
  Component.Type,
  Dialog.Type,
);
