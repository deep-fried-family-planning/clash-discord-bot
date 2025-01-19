import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Err} from '#src/internal/disreact/entity/index.ts';
import type {DA} from '#src/internal/disreact/model/entities/index.ts';
import {Co} from '#src/internal/disreact/model/entities/index.ts';
import {MainRoute} from '#src/internal/disreact/model/route/index.ts';
import {pipe} from '#src/internal/pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = {
  id     : str;
  token  : str;
  route  : MainRoute.T;
  message: Co.Message;
  dialog : Co.Dialog;
};


export type TEncoded = {
  id     : str;
  token  : str;
  route  : str;
  message: DA.TxMessage;
  dialog : DA.TxDialog;
};


export const allocate = (): T => ({
  id     : NONE,
  token  : NONE,
  route  : MainRoute.empty(),
  message: Co.emptyMessage(),
  dialog : Co.emptyDialog(),
});


export const setId = (id: str) => (dom: T) => {
  dom.id = id;
  return dom;
};


export const setToken = (token: str) => (dom: T) => {
  dom.token = token;
  return dom;
};


export const setRoute = (route: MainRoute.T) => (dom: T) => {
  dom.route = route;
  return dom;
};


export const setMessage = (message: Co.T) => (dom: T) => {
  if (!Co.isMessage(message)) {
    throw new Err.Critical();
  }
  dom.message = message;
  return dom;
};


export const setDialog = (dialog: Co.T) => (dom: T) => {
  if (!Co.isDialog(dialog)) {
    throw new Err.Critical();
  }
  dom.dialog = dialog;
  return dom;
};


export const decode = (encoded: TEncoded): T => pipe(
  allocate(),
  setId(encoded.id),
  setToken(encoded.token),
  setRoute(MainRoute.decodeUrl(encoded.route)),
  setMessage(Co.decodeMessage(encoded.message)),
  setDialog(Co.decodeDialog(encoded.dialog)),
);


export const restore = (restContainer: Co.T) => (dom: T): T => {
  console.error('[NOT_IMPLEMENTED]: DOM.restore()');
  return dom;
};


export const encode = (dom: T): TEncoded => {
  return {
    id     : dom.id,
    token  : dom.token,
    route  : MainRoute.encodeUrl(dom.route),
    message: pipe(dom.message, Co.encodeMessage(dom.route)),
    dialog : pipe(dom.dialog, Co.encodeDialog(dom.route)),
  };
};
