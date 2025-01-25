import {D, pipe} from '#pure/effect';
import type {DA} from 'src/internal/disreact/virtual/entities/index.ts';
import {Cm, Df, Em} from 'src/internal/disreact/virtual/entities/index.ts';
import {Err} from 'src/internal/disreact/virtual/kinds/index.ts';
import {DialogRoute, type MainRoute} from 'src/internal/disreact/virtual/route/index.ts';
import type {num, str} from 'src/internal/pure/types-pure.ts';



export type T = D.TaggedEnum<{
  Message: {defer?: Df.T; components: Cm.T[][]; embeds: Em.T[]};
  Dialog : {defer?: Df.T; components: Cm.T[][]; title: str; custom_id: str; onSubmit?: () => void; onOpen?: () => void};
}>;

export const T = D.taggedEnum<T>();

export type Message = D.TaggedEnum.Value<T, 'Message'>;
export type Dialog = D.TaggedEnum.Value<T, 'Dialog'>;

export const Message = T.Message;
export const Dialog  = T.Dialog;

export const isMessage = T.$is('Message');
export const isDialog  = T.$is('Dialog');


export const emptyMessage = () => Message({
  defer     : Df.None,
  embeds    : [],
  components: [],
});


export const emptyDialog = () => Dialog({
  defer     : Df.None,
  title     : '',
  custom_id : '',
  components: [],
});


export const setDefer = (defer: Df.T) => T.$match({
  Message: (con) => Message({...con, defer}),
  Dialog : (con) => Dialog({...con, defer}),
});


export const setComponents = (components: Cm.T[][]) => T.$match({
  Message: (con) => Message({...con, components}),
  Dialog : (con) => Dialog({...con, components}),
});


export const setEmbeds = (embeds: Em.T[]) => T.$match({
  Message: (con) => Message({...con, embeds}),
  Dialog : (con) => Dialog({...con}),
});


export const setTitle = (title: str) => T.$match({
  Message: (con) => con,
  Dialog : (con) => Dialog({...con, title}),
});


export const setCustomId = (custom_id: str) => T.$match({
  Message: (con) => con,
  Dialog : (con) => Dialog({...con, custom_id}),
});


export const setOnSubmit = (onSubmit: () => void) => T.$match({
  Message: (con) => Message({...con}),
  Dialog : (con) => Dialog({...con, onSubmit}),
});


export const setOnOpen = (onOpen: () => void) => T.$match({
  Message: (con) => Message({...con}),
  Dialog : (con) => Dialog({...con, onOpen}),
});


export const decodeMessage = (encoded: DA.TxMessage): Message => {
  console.error('[NOT_IMPLEMENTED]: Container.decodeMessage()');
  return emptyMessage();
};


export const encodeMessage = (route: MainRoute.T) => (con: T) => {
  if (!isMessage(con)) {
    throw new Err.Critical();
  }
  return {
    embeds    : pipe(con.embeds, Em.encodeAll(route)),
    components: Cm.encodeAll(con.components),
  } as DA.TxMessage;
};


export const decodeDialog = (encoded: DA.TxDialog): Dialog => {
  console.error('[NOT_IMPLEMENTED]: Container.decodeDialog()');
  return emptyDialog();
};


export const encodeDialog = (route: MainRoute.T) => (con: T) => {
  if (!isDialog(con)) {
    throw new Err.Critical();
  }

  return {
    custom_id: pipe(
      DialogRoute.empty(),
      DialogRoute.setRoot(route.params.root),
      DialogRoute.setNode(route.params.node),
      DialogRoute.setId(route.params.id),
      DialogRoute.setActive(route.params.active),
      DialogRoute.setDefer(route.params.defer),
      DialogRoute.encode,
    ),
  } as DA.TxDialog;
};


export const mapComponents = <
  A extends T,
>(
  mapper: (c: Cm.T, row: num, col: num) => Cm.T,
) => (
  self: A,
): A => pipe(
  self,
  setComponents(self.components.map((row, i) => row.map((c, j) => mapper(c, i, j)))),
) as A;


export const mapEmbeds = <
  A extends T,
>(
  mapper: (c: Em.T) => Em.T,
) => (
  self: A,
): A => {
  if (!isMessage(self)) throw new Err.Critical();
  return pipe(
    self,
    setEmbeds(self.embeds.map(mapper)),
  ) as A;
};
