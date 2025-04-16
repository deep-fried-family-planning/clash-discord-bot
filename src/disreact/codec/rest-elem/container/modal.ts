import {TextInput} from '#src/disreact/codec/rest-elem/component/textinput.ts';
import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {Util} from '#src/disreact/codec/rest-elem/util.ts';
import { Declare } from '#src/disreact/model/meta/declare.ts';
import {S} from '#src/disreact/utils/re-exports';
import {DAPI} from '../../dapi/dapi';

export * as Modal from '#src/disreact/codec/rest-elem/container/modal.ts';
export type Modal = never;

export const TAG  = 'modal',
             NORM = TAG;

export const EventData = S.Struct({
  data: DAPI.Modal.Data,
});

export const Handler = Declare.handler(EventData);

export const Children = S.Union(
  TextInput.Element,
);

export const Attributes = Util.declareProps(
  S.Struct({
    custom_id      : S.optional(S.String),
    title          : S.String,
    open           : S.optional(S.Boolean),
    [Keys.onsubmit]: Handler,
  }),
);

export const Element = Util.declareHandlerElem(
  TAG,
  Attributes,
  EventData,
);

export const encode = (self: any, acc: any) => {
  return {
    custom_id : self.props.custom_id ?? self.ids,
    title     : self.props.title,
    components: acc[Keys.components],
    open      : self.props.open,
  };
};
