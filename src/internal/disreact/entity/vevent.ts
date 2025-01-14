import type {RestDataResolved} from '#pure/dfx';
import {D} from '#pure/effect';
import type {num, obj, str} from '#src/internal/pure/types-pure.ts';


export type VEvent = D.TaggedEnum<{
  None     : obj;
  Clicked  : {row: num; col: num; values?: str[]; resolved?: RestDataResolved};
  Typed    : {row: num; col: num; value: str};
  Opened   : obj;
  Submitted: obj;
}>;
const VEvent             = D.taggedEnum<VEvent>();
export const None        = VEvent.None;
export const Clicked     = VEvent.Clicked;
export const Typed       = VEvent.Typed;
export const Opened      = VEvent.Opened;
export const Submitted   = VEvent.Submitted;
export const isNone      = VEvent.$is('None');
export const isClicked   = VEvent.$is('Clicked');
export const isTyped     = VEvent.$is('Typed');
export const isOpened    = VEvent.$is('Opened');
export const isSubmitted = VEvent.$is('Submitted');
