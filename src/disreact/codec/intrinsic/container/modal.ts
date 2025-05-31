import {TextInput} from '#src/disreact/codec/intrinsic/container/textinput.ts';
import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Util} from '#src/disreact/codec/intrinsic/util.ts';
import * as Declarations from '#src/disreact/model/schema/declarations.ts';
import * as S from 'effect/Schema';
import {DAPI} from '../../dapi/dapi';

export * as Modal from '#src/disreact/codec/intrinsic/container/modal.ts';
export type Modal = never;

export const TAG  = 'modal',
             NORM = TAG;

export const EventData = S.Struct({
  data: DAPI.Modal.Data,
});

export const Handler = Declarations.handler(EventData);

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
