import type {RestEmbed} from '#pure/dfx';
import {D} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {type Auth, Ed} from '#src/internal/disreact/entity/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = D.TaggedEnum<{
  Controller  : RestEmbed;
  DialogLinked: RestEmbed & {auth?: Auth.T[]; refs: str[]};
  Basic       : RestEmbed & {auth?: Auth.T[]; ref?: str};
  Status      : RestEmbed & {auth?: Auth.T[]; ref?: str};
}>;
export type Grid = T[];


export type Controller = D.TaggedEnum.Value<T, 'Controller'>;
export type DialogLinked = D.TaggedEnum.Value<T, 'DialogLinked'>;
export type Basic = D.TaggedEnum.Value<T, 'Basic'>;
export type Status = D.TaggedEnum.Value<T, 'Status'>;


export const T            = D.taggedEnum<T>();
export const Controller   = T.Controller;
export const DialogLinked = T.DialogLinked;
export const Basic        = T.Basic;


export const TitleEmbed  = T.Controller;
export const BasicEmbed  = T.Basic;
export const DialogEmbed = T.DialogLinked;
export const Status = T.Status;

export const is             = T.$is;
export const match          = T.$match;
export const isController   = is('Controller');
export const isDialogLinked = is('DialogLinked');
export const isBasic        = is('Basic');


export const render = (ev: T) => {
  if (isController(ev)) {
    const {_tag, ...data} = ev;
    return Ed.Controller({data});
  }
  if (isDialogLinked(ev)) {
    const {_tag, refs, ...data} = ev;
    return Ed.DialogLinked({data, refs});
  }
  if (isBasic(ev)) {
    const {_tag, ref = NONE, ...data} = ev;
    return Ed.Basic({data, ref: ref});
  }
  const {_tag, ref = NONE, ...data} = ev;
  return Ed.Status({data, ref});
};
