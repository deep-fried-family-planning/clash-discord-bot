import type {Cv, Ev} from '#discord/entities/index.ts';
import {Cx} from '#discord/entities/index.ts';
import {Ar, D, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type VoidOrVoidEffect = () => void | AnyE<void>;


export type DialogOutput = {
  title    : str;
  onSubmit?: VoidOrVoidEffect;
  onOpen?  : VoidOrVoidEffect;
};


export type ViewNodeDialogOutput = readonly [DialogOutput, ...Cv.Grid];


export type ViewNodeMessageOutput =
  | readonly [Ev.T, ...Cv.Grid]
  | readonly [Ev.T, Ev.T, ...Cv.Grid]
  | readonly [Ev.T, Ev.T, Ev.T, ...Cv.Grid]
  | readonly [Ev.T, Ev.T, Ev.T, Ev.T, ...Cv.Grid]
  | readonly [Ev.T, Ev.T, Ev.T, Ev.T, Ev.T, ...Cv.Grid];


export type ViewNodeOutput =
  ViewNodeDialogOutput
  | ViewNodeMessageOutput;


export type Meta = {
  name: str;
  path: Cx.Path;
};
export type E = {
  Entry  : Meta & {render: () => ViewNodeMessageOutput};
  Message: Meta & {render: () => ViewNodeMessageOutput};
  Dialog : Meta & {render: () => ViewNodeDialogOutput};
};
export type T = D.TaggedEnum<E>;

export type MessageNode = () => ViewNodeMessageOutput;
export type DialogNode = () => ViewNodeDialogOutput;


export const E             = D.taggedEnum<T>();
export const match         = E.$match;
export const is            = E.$is;
export const pure          = <A extends T>(a: A) => a;
export const set           = <A extends T, B extends keyof A, C extends A[B]>(b: B, c: C) => (a: A) => (a[b] = c) && a;
export const mapTo         = <A extends T, B>(fa: (a: A) => B) => (a: A) => fa(a);
export const mapSame       = <A extends T>(fa: (a: A) => A) => (a: A) => fa(a);
export const getEmbeds     = (output: ViewNodeOutput) => output.filter((r) => !Array.isArray(r)) as unknown as Ev.Grid;
export const getComponents = (output: ViewNodeOutput) => output.filter((r) => Array.isArray(r)) as unknown as Cv.Grid;
export const parseOutput   = (output: ViewNodeOutput) => pipe(output as never, Ar.partition(Ar.isArray)) as unknown as readonly [Ev.Grid, Cv.Grid];


export const Entry   = E.Entry;
export const Message = E.Message;
export const Dialog  = E.Dialog;

export const isEntry = is('Entry');
export const isMessage = is('Message');
export const isDialog = is('Dialog');


export const DialogHeader = (props: DialogOutput) => props;


export const makeEntry   = (name: str, render: MessageNode) => Entry({name, render, path: Cx.Path.empty()});
export const makeMessage = (name: str, render: MessageNode) => Message({name, render, path: Cx.Path.empty()});
export const makeDialog  = (name: str, render: DialogNode) => Dialog({name, render, path: Cx.Path.empty()});
