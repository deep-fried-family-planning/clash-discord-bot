import {Data} from 'effect';


export type AutoComplete = {
  choices: [];
};

export type Message = {
  public?   : boolean;
  components: [][];
};

export type Dialog = {
  custom_id : string;
  title     : string;
  components: [][];
};

export type OutT = Data.TaggedEnum<{
  AutoComplete: AutoComplete;
  Message     : Message;
  Dialog      : Dialog;
}>;

const out = Data.taggedEnum<OutT>();

export const {
               AutoComplete,
               Message,
               Dialog,
             }              = out;
export const isAutoComplete = out.$is('AutoComplete');
export const isMessage      = out.$is('Message');
export const isDialog       = out.$is('Dialog');
